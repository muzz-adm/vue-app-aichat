import { createRouter, createWebHistory } from 'vue-router'
import HomeIndex from "@/components/HomeIndex.vue";
import AuthPage from '@/views/AuthPage.vue'
import AuthPageLogin from "@/views/AuthPageLogin.vue";
import AuthPageRegister from "@/views/AuthPageRegister.vue";
import ChatInterfaceMain from "@/components/ChatInterfaceMain.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: HomeIndex
    },
    {
      path: "/auth",
      component: AuthPage,
      children: [
        {
          path: "login",
          component: AuthPageLogin,
        },
        {
          path: "register",
          component: AuthPageRegister,
        }
      ]
    },
    {
      path: "/chat/:chatId",
      component: ChatInterfaceMain
    }
  ],
})

export default router
