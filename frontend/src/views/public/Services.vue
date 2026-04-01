<template>
  <div class="services">
    <h2>我們的服務</h2>
    <div class="service-list">
      <div v-for="service in services" :key="service.id" class="service-card">
        <h3>{{ service.name }}</h3>
        <p>{{ service.description }}</p>
        <p class="price">NT$ {{ service.price }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import http from '@/api/http';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

const services = ref<Service[]>([]);

onMounted(async () => {
  try {
    const res = await http.get('/services');
    // 後端回應格式: { success: true, data: [...] }
    services.value = res.data;   // 修正：直接取 res.data
    console.log('服務資料:', services.value);
  } catch (error) {
    console.error('載入服務失敗', error);
  }
});
</script>

<style scoped>
.services { padding: 2rem; }
.service-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 1.5rem; }
.service-card { background: white; border-radius: 24px; padding: 1.5rem; box-shadow: var(--shadow); }
.price { color: var(--accent); font-weight: bold; }
</style>