<template>
  <div class="products-page">
    <h2>推薦產品</h2>
    <div class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="card-image">
          <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
          <div v-else class="no-image">暫無圖片</div>
        </div>
        <div class="card-content">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          <p class="price">NT$ {{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import http from '@/api/http';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
}

const products = ref<Product[]>([]);

onMounted(async () => {
  try {
    const res = await http.get('/products');
    products.value = res.data;
    console.log('產品資料:', products.value);
  } catch (error) {
    console.error('載入產品失敗', error);
  }
});
</script>

<!-- <style scoped>
.products {
  padding: 2rem;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
}

.product-card {
  flex: 0 0 calc(25% - 1.125rem);
  background: white;
  border-radius: 24px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
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

/* 響應式 */
@media (max-width: 1024px) {
  .product-card {
    flex: 0 0 calc(50% - 0.75rem);
  }
}

@media (max-width: 640px) {
  .product-card {
    flex: 0 0 100%;
  }
}
</style> -->