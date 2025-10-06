<script>
  export default {
    name: 'ChatWindowDelete',
    props: ['chat_id'],
    data() {
      return {
        api_baseurl: "https://aic.api.muzzink.cn",
        Disables: {
          Buttons: false,
          Error: {
            Enabled: false,
            ErrorMessage: '',
          }
        }
      }
    },
    methods: {
      close() {
        this.$emit('close', 'delete')
      },
      confirmDelete(){
        this.Disables.Buttons = true;
        this.Disables.Error.Enabled = false;
        const postData = {
          chat_id: this.chat_id,
          session: this.$cookies.get("sessionId"),
        }
        fetch(this.api_baseurl + "/api/chat/delete.php", {
          method: "POST",
          body: JSON.stringify(postData)
        })
            .then(res => res.json())
            .then(data => {
              if(data.success){
                this.$router.push({ path: "/chat/new" })
                console.log("[ChatComponent] 对话删除：操作执行成功。")
              }else{
                this.Disables.Error.Enabled = true;
                this.Disables.Error.ErrorMessage = data.error;
                console.error("[ChatComponent] 对话删除：删除失败。" + data.error)
              }
            })
            .catch(err => {
              this.Disables.Error.Enabled = true;
              this.Disables.Error.ErrorMessage = err;
              console.log("[ChatComponent] 对话删除：脚本运行时出现错误。" + err)
            })
            .then(() => {
              this.Disables.Buttons = false;
            })
      }
    }
  }
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content window_delete">
      <div class="box">
        <article class="message is-danger" v-if="this.Disables.Error.Enabled">
          <div class="message-body">
            <i class="fas fa-exclamation-triangle"></i>&nbsp;{{ this.Disables.Error.ErrorMessage }}
          </div>
        </article>
        <p style="margin-bottom: 10px;">确定要删除吗？此操作不可撤销！</p>
        <div class="buttons">
          <button class="button" v-if="this.Disables.Buttons" disabled>取消</button>
          <button class="button" @click="close" v-if="!this.Disables.Buttons">取消</button>
          <button class="button is-danger" v-if="this.Disables.Buttons" disabled>删除</button>
          <button class="button is-danger" @click="confirmDelete" v-if="!this.Disables.Buttons">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @media (orientation: portrait) {
    div.window_delete {
      width: 80%;
    }
  }
  .is-danger {
    color: #ffffff;
  }
</style>