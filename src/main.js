import './assets/bulma.min.css'
import './assets/font-awesome/css/all.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import cookie from 'vue3-cookies'

const app = createApp(App)

app.use(router)
app.use(cookie)

app.mount('#app')
