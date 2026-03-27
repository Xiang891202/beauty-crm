<template>
  <div class="public-layout">
    <header>Public Header</header>
    <main>
      <router-view />
    </main>
    <footer>Public Footer</footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
}
</style>