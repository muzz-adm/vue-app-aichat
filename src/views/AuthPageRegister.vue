<script>
import AuthPageOptions from "@/views/AuthPageOptions.vue";
export default {
  components: {
    AuthPageOptions
  },
  mounted() {
    document.title = "用户注册 - AiChat Web"
  }
}
</script>

<template>

  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-content">
          <div class="content">
            <h2 class="form-title">注册账号</h2>
            <hr>
            <div class="field-area">
              <article class="message is-danger">
                <div class="message-body">
                  <i class="fas fa-exclamation-triangle"></i> 当前未开放用户注册。
                </div>
              </article>
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