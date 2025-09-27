<script setup>

</script>

<template>
  <small>
    <router-link to="/auth/login" class="inner-link">
      <i class="fa-solid fa-arrow-right-to-bracket"></i> 用户登录
    </router-link>
    <router-link to="/auth/register" class="inner-link">
      <i class="fas fa-user-plus"></i> 注册账号
    </router-link>
    <router-link to="/auth/reset-key" class="inner-link">
      <i class="fas fa-unlock-keyhole"></i> 找回密码
    </router-link>
  </small>
</template>

<style scoped>
  a.inner-link {
    color: #01A9DB;
    padding: 0 10px 0 10px;
  }
  @media (max-width: 768px)  {
    a.inner-link {
      padding: 3px;
      width: 100%;
    }
  }
</style>