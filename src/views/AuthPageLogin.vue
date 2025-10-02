<script>
  import AuthPageOptions from "@/views/AuthPageOptions.vue";
  export default {
    components: { AuthPageOptions },
    data() {
      return {
        api_baseurl: "https://chat.api.muzzink.cn:233",
        isDisabled: false,
        isLoading: "",
        errorMessage: null
      }
    },
    methods: {
      enterSubmitLogin() {
        if(!this.isDisabled) {
          this.SubmitLogin()
        }
      },
      SubmitLogin() {
        this.isDisabled = true;
        this.isLoading = "is-loading";
        this.errorMessage = null;
        const postData = {
          userId: this.$refs.UserId.value,
          userPass: this.$refs.UserPass.value,
        }
        fetch(this.api_baseurl + "/api/account/login.php", {
          method: "POST",
          body: JSON.stringify(postData),
        })
            .then(response => response.json())
            .then(data => {
              if(data.success === true) {
                console.log("[AuthPage] 登录：操作成功。")
                this.$cookies.set("sessionId", data.data.session);
                this.$router.push({ path: "/chat/new" });
              }else{
                this.errorMessage = data.error
                console.error("[AuthPage] 登录：登录失败。" + data.error)
              }
            })
            .catch(error => {
              this.errorMessage = error
              console.error("[AuthPage] 登录：登录失败。" + error)
            })
            .then(() => {
              this.isDisabled = false
              this.isLoading = "";
            })
      }
    },
    mounted() {
      document.title = "用户登录 - AiChat Web"
    }
  }
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-content">
          <div class="content">
            <h2 class="form-title">用户登录</h2>
            <hr>
            <div class="form-title">
              <div class="field" v-if="errorMessage !== null">
                <article class="message is-danger">
                  <div class="message-body">
                    <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
                  </div>
                </article>
              </div>
              <div class="field">
                <p class="control has-icons-left">
                  <input class="input"
                         type="text"
                         placeholder="账户"
                         ref="UserId"
                         :disabled="isDisabled"
                         @keyup.enter="enterSubmitLogin"
                         value=""/>
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                </p>
              </div>
              <div class="field">
                <p class="control has-icons-left">
                  <input class="input"
                         type="password"
                         placeholder="密码"
                         ref="UserPass"
                         :disabled="isDisabled"
                         @keyup.enter="enterSubmitLogin"
                         value=""/>
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                </p>
              </div>
              <div class="field">
                <button
                    class="button is-info btn-submit"
                    @click="SubmitLogin"
                    :class="isLoading"
                    :disabled="isDisabled" >登录</button>
              </div>
            </div>
            <hr>
            <div class="field-area">
              <AuthPageOptions />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  section.section {
    background-color: #FAFAFA;
    display: flex;
    height: 100vh;
  }
  div.container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  div.card {
    width: 28rem;
    text-align: center;
  }
  div.content {
    padding: 1.4rem 1.4rem 0.1rem 1.4rem;
  }
  div.field-area {
    width: 90%;
    margin: 0 auto;
  }
  h2.form-title {
    color: #01A9DB;
    font-weight: initial;
  }
  button.btn-submit {
    color: #FFFFFF;
    width: 100%;
  }
</style>