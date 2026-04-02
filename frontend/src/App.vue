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