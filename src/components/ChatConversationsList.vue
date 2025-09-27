<script>
  export default {
    name: 'ChatConversationsList',
    props: ['uid'],
    data() {
      return {
        api_baseurl: "https://chat.api.muzzink.cn:233",
        dropdownTitleBar: false,
        error_window: {
          isActive: false,
          errorReason: ''
        },
        chatConversations: null,
        chatLists: 0
      }
    },
    methods: {
      hiddenError() {
        this.error_window.isActive = false
      },
      showError() {
        this.error_window.isActive = true
      },
      switchDropdownTitleBar() {
        if(this.dropdownTitleBar) {
          this.dropdownTitleBar = false
          this.$refs.dropdownTitleBar.classList.remove("is-active")
        }else{
          this.dropdownTitleBar = true
          this.$refs.dropdownTitleBar.classList.add("is-active")
        }
      },
      getChatConversations() {
        const postData = {
          session: this.$cookies.get("sessionId"),
        }
        fetch(this.api_baseurl + "/api/chat/conversations.php", {
          method: "POST",
          body: JSON.stringify(postData)
        })
            .then(res => res.json())
            .then(data => {
              if(data.success) {
                this.chatConversations = data.data;
                this.chatLists = this.chatConversations.length;
                console.log("[ChatListComponent] 成功获取对话列表。");
              }else{
                console.error("[ChatListComponent] 无法获取对话列表:" + data.error);
              }
            })
            .catch(error => {
              console.error("[ChatListComponent] 在获取对话列表时，脚本执行出现错误：" + error);
            })
            .then(() => {

            })
      },
      logoutAccount() {
        console.log("[ChatComponent] 已成功进行退出登录操作。");
        this.$cookies.remove("sessionId");
        this.$router.push({ path: "/auth/login" });
      },
      historyback() {
        window.history.back(-1);
      },
    },
    mounted() {
      document.title = "对话历史 | AiChat Web"
      this.getChatConversations()
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
        <div class="dropdown" @click="historyback">
          <div class="dropdown-trigger">
            <button class="button"
                    style="border: none; box-shadow: none;">
              <span><i class="fa-solid fa-arrow-left" @click=""></i></span>
            </button>
          </div>
        </div>
        <div class="dropdown"
             ref="dropdownTitleBar"
             @click="switchDropdownTitleBar">
          <div class="dropdown-trigger">
            <button class="button"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    style="border: none; box-shadow: none;">
              <span>对话历史</span>
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
              <RouterLink class="dropdown-item" to="/chat/new">发起新的对话</RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="historyCenter">
        <h2 style="font-weight: bold; margin-bottom: 10px;">所有对话历史</h2>
        <div class="card">
          <div class="card-content">
            <div class="LoadingBlock" v-if="this.chatConversations === null">
              <div class="Progress">
                <progress class="progress is-small is-primary" max="100">15%</progress>
              </div>
            </div>
            <div class="historyBlock" v-if="this.chatConversations !== null">
              <ul>
                <router-link
                    class="conversation_link"
                    to="/chat/new">
                  <li>
                    <span class="tag is-link is-rounded" style="color: #ffffff; height: 24px; line-height: 24px;">
                      #
                    </span> 发起新的对话
                  </li>
                </router-link>
                <hr>
                <router-link
                    v-for="(item, key) in chatConversations"
                    class="conversation_link"
                    :to="{ path: '/chat/' + item.chat_id }">
                  <li>
                    <span class="tag is-info is-rounded" style="color: #ffffff;">{{ key + 1 }}</span> {{ decodeURIComponent(item.chat_title) }}
                  </li>
                </router-link>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @media (orientation: portrait){
    div.main {
      width: 100vh;
      height: 100vh;
    }
    div.chatmain {
      width: 100%;
      height: 100%;
      border-radius: 5px;
      border: #e6e6e6 solid 1px;
      padding: 10px 10px 10px 10px;
    }
    div.portraitTitleBar {
      height: 50px;
      line-height: 50px;
      padding-left: 35px;
      border-bottom: solid #e6e6e6 1px;
    }
    div.historyCenter {
      margin-top: 30px;
    }
  }
  @media (orientation: landscape){
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
    div.historyCenter {
      display: block;
      height: 80%;
      width: 750px;
      margin: 0 auto;
    }
    div.LoadingBlock {
      display: flex;
      width: 100%;
      justify-content: center;
    }
    div.Progress {
      width: 50%;
    }
  }
  li {
    padding-left: 6px;
    height: 35px;
    line-height: 35px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  a.conversation_link {
    color: hsla(221deg,14%,29%,1);
  }
  li:hover {
    background-color: #e6e6e6;
    border-radius: 6px;
  }
  div.historyBlock {
    overflow: scroll;
  }
</style>