<script>
  import { marked } from 'marked';
  import ChatWindowRename from "@/components/ChatWindowRename.vue";
  import ChatWindowDelete from "@/components/ChatWindowDelete.vue";
  export default{
    name: "ChatAreaMessages",
    components: {ChatWindowDelete, ChatWindowRename},
    props: ['uid'],
    data(){
      return {
        api_baseurl: "https://aic.api.muzzink.cn",
        error_window: {
          isActive: false,
          errorReason: ""
        },
        chat_error: {
          showError: false,
          errorReason: ""
        },
        windows: {
          rename: false,
          delete: false,
        },
        chatTitle: '',
        chatMessages: '',
        chatInputBox: '',
        btnShow: false,
        chatManageDropdownEnabled: false,
        nowChatId: this.$route.params.chatId,
      }
    },
    methods: {
      logoutAccount() {
        console.log("[ChatComponent] 已成功进行退出登录操作。");
        this.$cookies.remove("sessionId");
        this.$router.push({ path: "/auth/login" });
      },
      ResetStatus() {
        this.hiddenError()
        this.chat_error.showError = false
        this.chatMessages = ''
        this.nowChatId = this.$route.params.chatId
      },
      enterSendMessage() {
        if(this.btnShow && this.chatInputBox.length > 2) {
          this.sendMessage(this.chatInputBox)
        }
      },
      renameChat(newname) {
        document.title = newname + " - 对话 | AiChat Web"
        this.chatTitle = encodeURIComponent(newname)
      },
      switchDropdown() {
        if (this.chatManageDropdownEnabled) {
          this.chatManageDropdownEnabled = false
          this.$refs.dropdown_manage_chat.classList.remove('is-active')
        }else{
          this.chatManageDropdownEnabled = true
          this.$refs.dropdown_manage_chat.classList.add('is-active')
        }
      },
      hiddenError() {
        this.error_window.isActive = false
      },
      showError() {
        this.error_window.isActive = true
      },
      showWindow(target) {
        if(target === "rename"){
          this.windows.rename = true
        }
        if(target === "delete"){
          this.windows.delete = true
        }
        console.log("[ChatComponent] 窗口管理器 | 已“打开”指定窗口：" + target)
      },
      closeWindow(target) {
        if(target === "rename"){
          this.windows.rename = false
        }
        if(target === "delete"){
          this.windows.delete = false
        }
        console.log("[ChatComponent] 窗口管理器 | 已“关闭”指定窗口：" + target)
      },
      scrollToBottom() {
        setTimeout(() => {
          const MessageArea = this.$refs.MessageArea
          MessageArea.scrollTop = MessageArea.scrollHeight
        }, 100)
      },
      getChatHistory() {
        const postData = {
          session: this.$cookies.get("sessionId"),
          chatid: this.nowChatId,
        }
        fetch(this.api_baseurl + "/api/chat/history.php", {
          method: "POST",
          body: JSON.stringify(postData)
        })
            .then(response => response.json())
            .then(data => {
              if(data.success){
                this.chatTitle = data.chat_name
                this.chatMessages = data.data
                this.scrollToBottom()
                document.title = decodeURIComponent(this.chatTitle) + " - 对话 | AiChat Web"
                const messageCount = this.chatMessages.length
                console.log("[ChatComponent] 已成功接收到消息数量：" + messageCount)
                console.log("[ChatComponent] 成功接收到所有的消息记录。")
                if(messageCount === 1){
                  console.log("[ChatComponent] 没有获取到后端的消息记录，正在尝试向后端发送消息。")
                  const latestMessage = decodeURIComponent(this.chatMessages.slice(-1)[0].message)
                  this.btnShow = true
                  this.$refs.messageContent.value = latestMessage
                  setTimeout(()=>{ this.sendMessage(latestMessage, false) },600)
                }
              }else{
                console.error("[ChatComponent] 无法获取到消息记录：" + data.error)
                this.chat_error.showError = true
                this.chat_error.errorReason = "错误信息：\n\r" + data.error
                if(data.redirectto_new){
                  console.error("[ChatComponent] 由于该对话不存在，将路由到主页。")
                  this.$router.push({ path: "/chat/new" })
                }
              }
            })
            .catch(error => {
              this.chat_error.showError = true
              this.chat_error.errorReason = "运行时错误：\n\r" + error
              console.error("[ChatComponent] 执行脚本时出现错误：" + error)
            })
            .then(() => {

            })
      },
        // 流式传输
      async sendMessage(Message, pushNewMessage = true) {
        if (pushNewMessage) {
          this.chatMessages.push({
            sender: 'PrimaryUser',
            message: Message,
          })
        }
        this.chatMessages.push({
          sender: 'Bot',
          status: '1',
          message: ''
        })
        const lastMessageSeq = this.chatMessages.length - 1
        setTimeout(()=>{
          this.scrollToBottom()
        }, 800)
        this.$refs.sendBtn.classList.add('is-loading')
        this.$refs.messageContent.setAttribute('disabled', 'disabled')
        const postData = {
          session: this.$cookies.get("sessionId"),
          chatid: this.$route.params.chatId,
          message: Message,
          insert_user_message: pushNewMessage,
        }
        const response = await fetch(this.api_baseurl + '/api/chat/send.php', {
          method: "POST",
          body: JSON.stringify(postData),
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 检测换行符，分割 JSON 数据
          const lines = buffer.split('\r');
          buffer = lines.pop(); // 保留未完成的 JSON 数据

          lines.forEach((line) => {
            if (line.trim()) {
              try {
                const backend_data = JSON.parse(line);
                this.chatMessages.splice(lastMessageSeq, 1, {
                  status: '0',
                  sender: 'Bot',
                  message: this.chatMessages.slice(-1)[0].message + decodeURIComponent(backend_data.data.response),
                  response_time: backend_data.data.response_time
                })
                console.log("[ChatComponent] 接收后端数据：" + backend_data)
                this.$refs.sendBtn.classList.remove('is-loading')
                this.$refs.messageContent.removeAttribute('disabled')
                this.chatInputBox = null
                this.scrollToBottom()
              } catch (error) {
                console.error('[ChatComponent] 接收后端数据时出现错误：', error);
              }
            }
          });
        }
      },
        /* 无流式传输
      sendMessage(Message, pushNewMessage = true) {
        if (pushNewMessage) {
          this.chatMessages.push({
            sender: 'PrimaryUser',
            message: Message,
          })
        }
        setTimeout(()=>{
          this.chatMessages.push({
            sender: 'Bot',
            status: '1',
            message: ''
          })
        },800)
        setTimeout(()=>{
          this.scrollToBottom()
        }, 800)
        this.$refs.sendBtn.classList.add('is-loading')
        this.$refs.messageContent.setAttribute('disabled', 'disabled')
        const postData = {
          session: this.$cookies.get("sessionId"),
          chatid: this.$route.params.chatId,
          message: Message,
          insert_user_message: pushNewMessage,
        }
        fetch(this.api_baseurl + '/api/chat/send.php',{
          method: 'POST',
          body: JSON.stringify(postData),
        })
            .then(res => res.json())
            .then(data => {
              if(data.success){
                const lastMessageSeq = this.chatMessages.length - 1
                if(data.data.response === ""){
                  this.chatMessages.splice(lastMessageSeq, 1, { message: decodeURIComponent(data.data.response), status: '2', sender: 'Bot' })
                }else{
                  this.chatMessages.splice(lastMessageSeq, 1, { message: decodeURIComponent(data.data.response), status: '0', sender: 'Bot', response_time: data.data.response_time })
                }
                this.scrollToBottom()
                this.chatInputBox = null
                console.log("[ChatComponent] 已成功接收到来自后端的消息。")
              }else{
                this.showError()
                this.error_window.errorReason = "无法处理您的请求。\n\r" + data.error
                console.error(`[ChatComponent] 无法向后端发出请求：${data.error}`)
              }
            })
            .catch(err => {
              this.showError()
              this.error_window.errorReason = "无法处理您的请求。\n\r" + err
              console.error(`[ChatComponent] 向后端发送请求时，执行脚本时出现错误：${err}`)
            })
            .then(() => {
              this.$refs.sendBtn.classList.remove('is-loading');
              this.$refs.messageContent.removeAttribute('disabled')
            })
      },*/
      historyback() {
        window.history.back(-1);
      },
      parsedMarkdown(message){
        return marked(message)
      }
    },
    mounted() {
      //this.getChatHistory()
    },
    watch: {
      '$route': {
        handler(to, from) {
          this.ResetStatus()
          this.getChatHistory()
        },
        deep: true,
        immediate: true
      },
      chatInputBox() {
        this.btnShow = this.$refs.messageContent.textLength > 0
      }
    },
  }
</script>

<template>
  <div class="main">
    <!-- 拟态框 -->
    <ChatWindowRename :chat_id="this.nowChatId" v-if="this.windows.rename" @close="closeWindow" @rename="renameChat" />
    <ChatWindowDelete :chat_id="this.nowChatId" v-if="this.windows.delete" @close="closeWindow" />
    <!-- 错误提示框 -->
    <div class="modal" v-if="error_window.isActive" :class="error_window.isActive ? 'is-active' : ''">
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="card">
          <div class="card-content">
            <article class="message is-danger">
              <div class="message-header" style="color: #ffffff">
                <p>出现错误</p>
                <button class="delete" @click="hiddenError"></button>
              </div>
              <div class="message-body">
                <p>在处理您的请求时出现错误，具体原因如下：</p>
                <br>
                <pre><code>{{ error_window.errorReason }}</code></pre>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
    <div class="chatmain">
      <!-- 对话名称（标题）、下拉框 -->
      <div class="ChatTitle">
        <div class="dropdown" @click="historyback">
          <div class="dropdown-trigger">
            <button class="button"
                    style="border: none; box-shadow: none;">
              <span><i class="fa-solid fa-arrow-left" @click=""></i></span>
            </button>
          </div>
        </div>
        <div class="dropdown" ref="dropdown_manage_chat" v-if="chatTitle !== ''"
             @click="switchDropdown">
          <div class="dropdown-trigger">
            <button class="button"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    style="border: none; box-shadow: none;">
              <span>{{ decodeURIComponent(chatTitle) }}</span>
              <span class="icon is-small">
                <i v-if="chatManageDropdownEnabled" class="fas fa-angle-up" aria-hidden="true"></i>
                <i v-if="!chatManageDropdownEnabled" class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a class="dropdown-item" readonly="">已登录：{{ this.uid }}</a>
              <a class="dropdown-item" @click="logoutAccount">退出当前登录</a>
              <hr class="dropdown-divider">
              <RouterLink class="dropdown-item" to="/chat/new">发起新的对话</RouterLink>
              <RouterLink class="dropdown-item" to="/chat/history">查看对话列表</RouterLink>
              <hr class="dropdown-divider">
              <a class="dropdown-item" @click="showWindow('rename')">修改名称</a>
              <a class="dropdown-item" @click="showWindow('delete')">删除对话</a>
            </div>
          </div>
        </div>
      </div>
      <!-- 消息区域 -->
      <div ref="MessageArea"
           class="MessageArea"
           :style="chat_error.showError ? 'align-items: center; display: grid;' : ''">
        <div class="MessageLoading" v-show="chatMessages === '' && !chat_error.showError">
          <div style="display: block; width: 50%;">
            <progress class="progress is-small is-primary" max="100">15%</progress>
          </div>
        </div>
        <article class="message is-danger" v-if="chat_error.showError">
          <div class="message-header" style="color: #ffffff">
            <p>出现错误</p>
          </div>
          <div class="message-body">
            <p>在处理您的请求时出现错误，请稍后再试：</p>
            <br>
            <pre><code>{{ chat_error.errorReason }}</code></pre>
          </div>
        </article>
        <!-- 消息泡泡 -->
        <div class="MessageBubble"
             v-if="chatMessages !== ''" v-for="(item, key) in chatMessages"
             :style="item.sender === 'PrimaryUser' ? 'justify-content: end;' : ''">
          <div class="ChatBubble" :class="item.sender === 'PrimaryUser' ? 'RoleUser' : 'RoleBot'">
            <div v-if="item.sender === 'Bot'" style="display: flex;" class="RoleBot">
              <img src="@/assets/logo-test.jpg"
                    alt="application logo"
                    style="width: 26px; height: 26px; border-radius: 12px; margin-right: 16px;"
                    v-if="item.sender === 'Bot'">
              <div class="" style="display: block">
                <i v-if="item.status === '1'"
                    style="color: #74c0fc; --fa-animation-duration: 0.55s;"
                    class="fas fa-circle-notch fa-spin fa-2x"></i>
                <div class="botMessage" v-if="item.status === '0'">
                  <p v-html="parsedMarkdown(decodeURIComponent(item.message))"></p>
                </div>
                <div class="botMessage" v-if="item.status === '2'">
                  <p style="color: hsl(348deg,100%,calc(70% + -5%));">
                    <i class="fas fa-exclamation-triangle"></i> 出现错误，没有从服务器接收到有效的数据，请再试一次。
                  </p>
                  <span class="tag is-light" style="margin-top: 10px;">无法计算回复所使用的时间。</span>
                </div>
                <div class="botResponseTime" v-if="item.status === '0'">
                  <span class="tag is-light">本次回复已使用时间：{{ item.response_time }}秒</span>
                </div>
              </div>
            </div>
            <div v-if="item.sender === 'PrimaryUser'" class="RoleUser">
              {{ decodeURIComponent(item.message) }}
            </div>
          </div>
        </div>
      </div>
      <!-- 用户输入区 -->
      <div class="TextArea">
        <div class="text-zone card">
          <div class="card-content">
            <textarea autofocus
                      ref="messageContent"
                      v-model="chatInputBox"
                      class="text-area"
                      @keyup.enter="enterSendMessage"
                      placeholder="请在这里输入你要向我提的问题..."></textarea>
            <div class="text-area-buttons">
              <button v-show="!btnShow" class="button is-info is-light is-small" disabled>
                <i class="fa-regular fa-paper-plane"></i>&nbsp;发送
              </button>
              <button v-show="btnShow"
                      class="button is-info is-small"
                      ref="sendBtn"
                      @click="sendMessage(this.$refs.messageContent.value)">
                <i class="fa-regular fa-paper-plane"></i>&nbsp;发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @media (orientation: portrait) {
    div.main {
      width: 100vw;
      height: 100vh;
    }
    div.chatmain {
      width: 100vw;
      border-radius: 5px;
      border: #e6e6e6 solid 1px;
      padding: 10px 10px 10px 10px;
      position: relative;
    }
    div.ChatTitle {
      height: 50px;
      line-height: 50px;
      padding-left: 35px;
      border-bottom: solid #e6e6e6 1px;
    }
    div.MessageArea {
      width: 95%;
      height: 70vh;
      margin: 0 auto;
      padding-top: 20px;
      padding-bottom: 90px;
      overflow-x: scroll;
      position: relative;
    }
    div.ChatBubble {
      margin-right: 5px;
      max-width: max-content;
      padding: 12px 12px 12px 12px;
      border-radius: 10px;
      width: 100%;
    }
    div.text-zone {
      width: 100%;
      height: 30%;
    }
    div.TextArea {
      width: 100%;
    }
  }
  @media (orientation: landscape) {
    div.main {
      width: 86vw;
      height: 100vh;
      border-top: 5px solid #FAFAFA;
      border-bottom: 5px solid #FAFAFA;
      border-right: 5px solid #FAFAFA;
    }
    @media (max-width: 1600px) {
      div.main {
        width: 80vw;
      }
    }
    div.chatmain {
      width: 88vw;
      border-radius: 5px;
      border: #e6e6e6 solid 1px;
      padding: 10px 10px 10px 10px;
      position: relative;
    }
    div.ChatTitle {
      height: 50px;
      line-height: 50px;
      padding-left: 35px;
      border-bottom: solid #e6e6e6 1px;
    }
    div.MessageArea {
      width: 70%;
      height: 75vh;
      margin: 0 auto;
      padding-top: 20px;
      padding-bottom: 90px;
      overflow-x: scroll;
      position: relative;
    }
    div.ChatBubble {
      margin-right: 25px;
      max-width: max-content;
      padding: 12px 12px 12px 12px;
      border-radius: 10px;
      width: 100%;
    }
    div.text-zone {
      width: 70%;
      height: 30%;
    }
    div.TextArea {
      width: 100%;
      position: absolute;
      bottom: 20px;
      display: flex;
      justify-content: center;
    }
  }
  div.MessageLoading {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
  }
  div.MessageBubble {
    width: 100%;
    display: flex;
    margin-bottom: 15px;
  }
  div.RoleUser {
    color: #ffffff;
    background-color: #0040FF;
  }
  div.RoleBot {
    color: hsla(221deg,14%,29%,1);
  }
  div.text-area-buttons {
    display: flex;
    justify-content: flex-end;
  }
  div.text-area-buttons button {
    color: #ffffff;
  }
  div.text-zone div.card-content {
    padding-bottom: 20px;
  }
  textarea.text-area {
    border: none;
    resize: none;
    outline: none;
    width: 100%;
    height: 70px;
    margin-bottom: 6px;
  }
  div.botResponseTime {
    margin-top: 10px;
  }
</style>
<style>
  ol {
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  h1 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 32px;
  }
  h2 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 24px;
  }
  h3 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 18.72px;
  }
  h4 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 16px;
  }
  h5 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 13.28px;
  }
  h6 {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 12px;
  }
</style>