<script>
import ChatInterfaceSidebar from "@/components/ChatInterfaceSidebar.vue";
import ChatAreaNew from "@/components/ChatAreaNew.vue";
import ChatAreaMessages from "@/components/ChatAreaMessages.vue";
import ChatConversationsList from "@/components/ChatConversationsList.vue";

export default {
  components: {ChatConversationsList, ChatAreaMessages, ChatInterfaceSidebar, ChatAreaNew},
  data() {
    return {
      api_baseurl: "https://aic.api.muzzink.cn",
      uid: '',
    }
  },
  methods: {
    validateSession() {
      const postData = {
        "session": this.$cookies.get("sessionId"),
      }
      fetch(this.api_baseurl + "/api/account/validate.php", {
        method: "POST",
        body: JSON.stringify(postData),
      })
          .then(response => response.json())
          .then(data => {
            if(data.success !== true) {
              this.$router.push({ path: "/auth/login" } )
            }else{
              this.uid = data.uid
            }
          })
          .catch(e => {
            this.$router.push({ path: "/auth/login" } )
      })
    }
  },
  mounted() {
    this.validateSession()
  }
}
</script>


<template>
  <div class="main">
    <ChatInterfaceSidebar />
    <ChatAreaNew v-if="$route.params.chatId === 'new'" :uid="this.uid" />
    <ChatConversationsList v-if="$route.params.chatId === 'history'" :uid="this.uid" />
    <ChatAreaMessages v-if="$route.params.chatId !== 'new' && $route.params.chatId !== 'history'" :uid="this.uid" />
  </div>
</template>

<style scoped>
  div.main {
    display: flex;
  }
</style>