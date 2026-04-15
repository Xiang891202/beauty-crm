<template>
  <div :class="themeClass">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const themeClass = computed(() => route.path.startsWith('/admin') ? 'theme-neutral' : 'theme-feminine');
</script>

<!-- <style>
/* 全域背景設定 */
.app-background {
  background-image: url('/images/logo.jpg');
  background-size: cover;        /* 覆蓋整個區域，保持比例 */
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;  /* 背景固定，滾動時不移動 */
  position: relative;
  min-height: 100vh;
}
/* 添加半透明白色遮罩，讓背景淡色且文字清晰 */
.app-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  pointer-events: none; /* 不影響點擊 */
  z-index: 0;
}
/* 確保所有內容在遮罩上方 */
.app-background > * {
  position: relative;
  z-index: 1;
}
</style> -->