<script>
  export default {
    name: 'ChatWindowRename',
    data () {
      return {
        api_baseurl: "https://chat.api.muzzink.cn:233",
        Disables: {
          Buttons: false,
          Error: {
            Enabled: false,
            ErrorMessage: '',
          }
        }
      }
    },
    props: ['chat_id'],
    methods: {
      close() {
        this.$emit('close', 'rename')
      },
      enterSubmit() {
        if(!this.Disables.Buttons) {
          this.submit()
        }
      },
      submit() {
        this.Disables.Buttons = true
        this.Disables.Error.Enabled = false
        this.$refs.typebox.setAttribute("disabled", "")
        const postData = {
          chat_id: this.chat_id,
          new_name: this.$refs.typebox.value,
          session: this.$cookies.get("sessionId"),
        }
        fetch(this.api_baseurl + "/api/chat/rename.php", {
          method: "POST",
          body: JSON.stringify(postData),
        })
            .then(res => res.json())
            .then(data => {
              if(data.success) {
                this.close();
                const newname = this.$refs.typebox.value
                this.$emit('rename', newname);
                console.log("[ChatComponent] 重命名：已成功命名该对话，新的名称为 " + newname);
              }else{
                this.Disables.Error.Enabled = true
                this.Disables.Error.ErrorMessage = data.error
                console.error("[ChatComponent] 重命名：重命名失败。" + data.error)
              }
            })
            .catch(err => {
              this.Disables.Error.Enabled = true
              this.Disables.Error.ErrorMessage = "重命名时出现错误：" + err
              console.error("[ChatComponent] 重命名：脚本运行时出现错误。" + err)
            })
            .then(() => {
              this.Disables.Buttons = false
              this.$refs.typebox.removeAttribute("disabled")
            })
      }
    },
  }
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content window_rename">
      <div class="box">
        <article class="message is-danger" v-if="this.Disables.Error.Enabled">
          <div class="message-body">
            <i class="fas fa-exclamation-triangle"></i>&nbsp;{{ this.Disables.Error.ErrorMessage }}
          </div>
        </article>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" type="text" placeholder="更改后的名称" ref="typebox" @keyup.enter="enterSubmit" />
            <span class="icon is-small is-left">
              <i class="fa-solid fa-pencil"></i>
            </span>
          </p>
        </div>
        <div class="buttons">
          <button class="button" v-if="this.Disables.Buttons" disabled>取消</button>
          <button class="button" @click="close" v-if="!this.Disables.Buttons">取消</button>
          <button class="button is-success" v-if="this.Disables.Buttons" disabled>保存更改</button>
          <button class="button is-success" @click="submit" v-if="!this.Disables.Buttons">保存更改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
 @media (orientation: portrait) {
   div.window_rename {
     width: 80%;
   }
 }
 .is-success {
   color: #ffffff;
 }
</style>