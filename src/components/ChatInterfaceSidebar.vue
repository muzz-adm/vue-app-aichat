<script>
  export default {
    name: 'ChatInterfaceSidebar',
    data: function () {
      return {
        api_baseurl: "https://chat.api.muzzink.cn:233",
        bbb: null,
        chatConversations: null,
        userId: '',
        dropdownEnabled: false,
        chatLists: 0
      }
    },
    methods: {
      switchDropdown() {
        if(this.dropdownEnabled) {
          this.dropdownEnabled = false;
        }else{
          this.dropdownEnabled = true;
        }
      },
      autoRefreshChatList() {
        this.bbb = setInterval(() => { this.getChatConversations() }, 2300);
      },
      unsetAutoRefreshChatList() {
        console.log('[SidebarComponent] 已清除掉自动执行脚本。');
        clearInterval(this.bbb);
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
                this.userId = data.uid;
                this.chatConversations = data.data;
                this.chatLists = this.chatConversations.length;
                console.log("[SidebarComponent] 成功获取对话列表。");
              }else{
                console.error("[SidebarComponent] 无法获取对话列表:" + data.error);
              }
            })
            .catch(error => {
              console.error("[SidebarComponent] 在获取对话列表时，脚本执行出现错误：" + error);
            })
            .then(() => {

            })
      },
      logoutAccount() {
        console.log("[SidebarComponent] 已成功进行退出登录操作。");
        this.$cookies.remove("sessionId");
        this.$router.push({ path: "/auth/login" });
      }
    },
    mounted: function () {
      this.getChatConversations();
      this.autoRefreshChatList();
    },
    beforeUnmount: function () {
      this.unsetAutoRefreshChatList();
    }
  }
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img src="@/assets/logo-test.jpg" alt="application logo">
      <div class="dropdown"
           :class="this.dropdownEnabled ? 'is-active' : ''"
           style="margin-bottom: 10px; width: 100%;"
           @click="switchDropdown">
        <div class="dropdown-trigger" style="width: 100%;">
          <button class="button is-primary"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  style="color: #ffffff;">
            <span><i class="fas fa-user"></i>&nbsp;UID: {{ userId }}</span>
            <span class="icon is-small">
            <i class="fas fa-angle-down" v-if="!this.dropdownEnabled" aria-hidden="true"></i>
            <i class="fas fa-angle-up" v-if="this.dropdownEnabled" aria-hidden="true"></i>
          </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a class="dropdown-item" @click="logoutAccount"> 退出登录 </a>
          </div>
        </div>
      </div>
      <router-link to="/chat/new">
        <button class="button is-info" style="color: #FFFFFF;">
          <i class="fa-solid fa-plus"></i>&nbsp;发起新的对话
        </button>
      </router-link>
    </div>
    <hr>
    <div class="sidebar-conversations">
      <p><i class="fa-solid fa-clock-rotate-left"></i>&nbsp;对话列表（{{ chatLists }}）</p>
      <ul>
        <router-link to="/chat/history" class="conversation_link">
          <li :class="this.$route.params.chatId === 'history' ? 'link-selected' : ''">
            <span class="tag is-primary is-rounded" style="color: #ffffff;">#</span> 查看所有记录
          </li>
        </router-link>
        <router-link
            v-for="(item, key) in chatConversations"
            class="conversation_link"
            :to="{ path: '/chat/' + item.chat_id }">
          <li :class="this.$route.params.chatId === item.chat_id ? 'link-selected' : ''">
            <span class="tag is-info is-rounded" style="color: #ffffff">{{ key + 1 }}</span> {{ decodeURIComponent(item.chat_title) }}
          </li>
        </router-link>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  @media (orientation: portrait) {
    div.sidebar {
      display: none;
    }
  }
  @media (orientation: landscape) {
    div.sidebar {
      height: 100vh;
      width: 14vw;
      background-color: #FAFAFA;
      padding: 20px 20px 10px 20px;
      overflow: scroll;
    }
    @media (max-width: 1600px) {
      div.sidebar {
        width: 20vw;
      }
    }
    div.sidebar-header img {
      width: 45px;
      height: 45px;
      display: block;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    div.sidebar-header button {
      font-size: small;
      width: 100%;
    }
    div.sidebar-conversations{
      font-size: 16px;
      padding-left: 10px;
      padding-top: 10px;
    }
    div.sidebar-conversations p {
      margin-bottom: 8px;
    }
    div.sidebar-conversations ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      height: 50%;
    }
    div.sidebar-conversations ul li {
      width: 95%;
      margin-left: 16px;
      padding-left: 6px;
      height: 35px;
      line-height: 35px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: small;
    }
    div.sidebar-conversations ul a {
      color: hsla(221deg,14%,29%,1);
    }
    div.sidebar-conversations ul li:hover {
      background-color: #e6e6e6;
      border-radius: 6px;
    }
    li.link-selected {
      background-color: #e6e6e6;
      border-radius: 6px;
    }
  }
</style>