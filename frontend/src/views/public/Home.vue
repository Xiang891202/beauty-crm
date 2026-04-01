<template>
  <div class="home">
    <section class="hero">
      <h1>綻放你的自信之美</h1>
      <p>專業美容服務，為您量身打造</p>
      <BaseButton @click="router.push('/services')">探索服務</BaseButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
const router = useRouter();
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fdf8f3 0%, #f9e5d6 100%);
  border-radius: var(--radius);
}
</style>