<template>
  <div>
    <h2>會員詳細</h2>
    <p>會員 ID: {{ id }}</p>
    <button @click="goToUseService">使用服務</button>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const goToUseService = () => {
  router.push('/admin/usage');
};
</script>