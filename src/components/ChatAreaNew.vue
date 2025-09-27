<script>
  export default {
    name: 'ChatAreaNew',
    data() {
      return {
        api_baseurl: "https://chat.api.muzzink.cn:233",
        error_window: {
          isActive: false,
          errorReason: null
        },
        chatInputBox: "",
        btnShow: false,
        dropdownTitleBar: false,
      }
    },
    props: ['uid'],
    mounted() {
      document.title = "欢迎 | AiChat Web"
    },
    methods: {
      switchDropdownTitleBar() {
        if(this.dropdownTitleBar) {
          this.dropdownTitleBar = false
          this.$refs.dropdownTitleBar.classList.remove("is-active")
        }else{
          this.dropdownTitleBar = true
          this.$refs.dropdownTitleBar.classList.add("is-active")
        }
      },
      hiddenError() {
        this.error_window.isActive = false
      },
      showError() {
        this.error_window.isActive = true
      },
      enterSendMessage() {
        if(this.btnShow && this.chatInputBox.length > 2) {
          this.sendMessage(this.chatInputBox)
        }
      },
      logoutAccount() {
        console.log("[ChatComponent] 已成功进行退出登录操作。");
        this.$cookies.remove("sessionId");
        this.$router.push({ path: "/auth/login" });
      },
      sendMessage(Message = this.chatInputBox) {
        this.$refs.sendBtn.classList.add('is-loading');
        this.$refs.messageContent.setAttribute('disabled', 'disabled')
        const postData = {
          chatid: "new",
          message: Message,
          session: this.$cookies.get("sessionId"),
        }
        fetch(this.api_baseurl + '/api/chat/send.php',{
          method: 'POST',
          body: JSON.stringify(postData),
        })
            .then(res => res.json())
            .then(data => {
              if(data.success){
                this.$router.push({ path: `/chat/${data.data.referto_chat}` })
              }else{
                this.showError()
                this.error_window.errorReason = "无法发起新的对话。\n\r" + data.error
                console.error(`[ChatComponent] 无法发起新的对话：${data.error}`)
              }
            })
            .catch(err => {
              this.showError()
              this.error_window.errorReason = "无法发起新的对话。\n\r" + err
              console.error(`[ChatComponent] 在发起新的对话时，脚本执行出现错误：${err}`)
            })
            .then(() => {
              this.$refs.sendBtn.classList.remove('is-loading');
              this.$refs.messageContent.removeAttribute('disabled')
            })
      }
    },
    watch: {
      chatInputBox() {
        this.btnShow = this.$refs.messageContent.textLength > 0;
      }
    }
  }
</script>

<template>
  <div class="main">
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
      <div class="portraitTitleBar">
        <div class="dropdown"
             ref="dropdownTitleBar"
             @click="switchDropdownTitleBar">
          <div class="dropdown-trigger">
            <button class="button"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    style="border: none; box-shadow: none;">
              <span>欢迎页</span>
              <span class="icon is-small">
                <i class="fas fa-angle-up" aria-hidden="true" v-if="this.dropdownTitleBar"></i>
                <i class="fas fa-angle-down" aria-hidden="true" v-if="!this.dropdownTitleBar"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a class="dropdown-item" readonly="">已登录：{{ this.uid }}</a>
              <a class="dropdown-item" @click="logoutAccount">退出当前登录</a>
              <hr class="dropdown-divider">
              <RouterLink class="dropdown-item" to="/chat/history">查看对话列表</RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="helper">
        <h3>👏 你好兄弟 👏</h3>
        <p></p>
        <div class="text-zone card">
          <div class="card-content">
            <textarea
                autofocus
                ref="messageContent"
                v-model="chatInputBox"
                class="text-area"
                @keyup.enter="enterSendMessage"
                placeholder="请在这里输入你要向我提的问题..."></textarea>
            <div class="text-area-buttons">
              <button v-show="!btnShow" class="button is-info is-light is-small" disabled>
                <i class="fa-regular fa-paper-plane"></i>&nbsp;发送
              </button>
              <button v-show="btnShow" class="button is-info is-small" @click="sendMessage(this.chatInputBox)" ref="sendBtn">
                <i class="fa-regular fa-paper-plane"></i>&nbsp;发送
              </button>
            </div>
          </div>
        </div>
        <hr>
        <div class="helper_asks">
          <div class="askquestions">
            <!-- 左列表 -->
            <div class="askquestions_area">
              <div class="askitem" @click="sendMessage('/list pods all')">
                <div class="askitem-icon"><i class="fa-solid fa-quote-left"></i></div>
                <div class="askitem-content">
                  <div class="askitem-content-title">/list pods all</div>
                  <div class="askitem-content-body">
                    列出所有节点中的 Pods
                  </div>
                </div>
              </div>
              <div class="askitem">
                <div class="askitem-icon"><i class="fa-solid fa-quote-left"></i></div>
                <div class="askitem-content">
                  <div class="askitem-content-title">/list pods buzhidao</div>
                  <div class="askitem-content-body">
                    列出不知道
                  </div>
                </div>
              </div>
            </div>
            <!-- 左列表-结束 -->
            <!-- 右列表 -->
            <div class="askquestions_area">
              <div class="askitem">
                <div class="askitem-icon"><i class="fa-solid fa-quote-left"></i></div>
                <div class="askitem-content">
                  <div class="askitem-content-title">/list pods liuxiaokang</div>
                  <div class="askitem-content-body">
                    列出运行在刘小康的 Pods
                  </div>
                </div>
              </div>
              <div class="askitem">
                <div class="askitem-icon"><i class="fa-solid fa-quote-left"></i></div>
                <div class="askitem-content">
                  <div class="askitem-content-title">/list pods xuwenhao</div>
                  <div class="askitem-content-body">
                    列出运行在许文昊的 Pods
                  </div>
                </div>
              </div>
            </div>
            <!-- 右列表-结束 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @media (orientation: portrait) {
    div.main {
      width: 100vh;
      height: 100vh;
    }
    div.portraitTitleBar {
      height: 50px;
      line-height: 50px;
      padding-left: 35px;
      border-bottom: solid #e6e6e6 1px;
    }
    div.chatmain {
      width: 100%;
      height: 100%;
      border-radius: 5px;
      border: #e6e6e6 solid 1px;
      padding: 10px 10px 10px 10px;
    }
    div.helper {
      width: 100%;
      height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    div.helper hr {
      width: 90%;
    }
    div.helper h3 {
      font-size: 26px;
    }
    div.helper p {
      margin-bottom: 10px;
    }
    div.text-zone {
      width: 90%;
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
    div.portraitTitleBar {
      display: none;
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
      padding: 10px 10px 0 10px;
      align-items: center;
      justify-content: center;
      display: flex;
    }
    div.helper {
      display: block;
      text-align: center;
      width: 740px;
    }
    div.helper h3 {
      font-size: 32px;
    }
    div.helper p {
      margin-bottom: 25px;
    }
    div.text-zone {
      width: 740px;
    }
    div.helper_asks {
      text-align: start;
      margin-right: 10px;
    }
    div.askquestions {
      display: flex;
    }
    div.askquestions_area {
      width: 45%;
      margin-left: 25px;
      margin-right: 50px;
    }
  }
  textarea.text-area {
    border: none;
    resize: none;
    outline: none;
    width: 100%;
    height: 70px;
    margin-bottom: 6px;
  }
  div.text-zone div.card-content {
    padding-bottom: 20px;
  }
  div.text-area-buttons {
    display: flex;
    justify-content: flex-end;
  }
  div.text-area-buttons button {
    color: #ffffff;
  }
  div.askitem {
    display: flex;
    padding: 8px 16px 8px 16px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  div.askitem:hover {
    cursor: pointer;
    background-color: #FAFAFA;
  }
  div.askitem .askitem-icon {
    margin-right: 14px;
    font-size: 26px;
  }
  div.askitem div.askitem-content-title {
    font-size: 22px;
    margin-top: 3px;
  }
</style>