<template>
  <div class="services-page">
    <h2>我們的服務</h2>
    <div class="service-grid">
      <div v-for="service in services" :key="service.id" class="service-card">
        <div class="card-image">
          <img v-if="service.image_url" :src="service.image_url" :alt="service.name" />
          <div v-else class="no-image">暫無圖片</div>
        </div>
        <div class="card-content">
          <h3>{{ service.name }}</h3>
          <p class="description">{{ service.description }}</p>
          <p class="price">NT$ {{ service.price }}</p>
        </div>
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
  image_url?: string | null;
}

const services = ref<Service[]>([]);

onMounted(async () => {
  try {
    const res = await http.get('/services');
    services.value = res.data;
    console.log('服務資料:', services.value);
  } catch (error) {
    console.error('載入服務失敗', error);
  }
});
</script>

<!-- <style scoped>
.services {
  padding: 2rem;
}

.service-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
}

.service-card {
  flex: 0 0 calc(25% - 1.125rem); /* 一行4個，扣除間距 */
  background: white;
  border-radius: 24px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.9rem;
}

.card-content {
  padding: 1rem;
}

.card-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: var(--accent);
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.price {
  color: var(--accent);
  font-weight: bold;
  margin: 0;
}

/* 響應式：平板 2 個 */
@media (max-width: 1024px) {
  .service-card {
    flex: 0 0 calc(50% - 0.75rem);
  }
}

/* 手機 1 個 */
@media (max-width: 640px) {
  .service-card {
    flex: 0 0 100%;
  }
}
</style> -->