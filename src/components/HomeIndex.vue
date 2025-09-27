<script>
  export default {
    name: 'HomeIndex',
    mounted(){
      this.$router.push({ path: '/auth/login' });
    }
  }
</script>

<template>
  这是首页
</template>

<style scoped>

</style>