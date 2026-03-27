<template>
  <div class="admin-layout">
    <header>Admin Header</header>
    <nav>Admin Nav</nav>
    <main>
      <router-view />
    </main>
    <footer>Admin Footer</footer>
  </div>
</template>

<script setup lang="ts">
// 可加權限檢查等
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
</style>