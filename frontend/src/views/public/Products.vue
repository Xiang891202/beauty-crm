<template>
  <div class="products">
    <h2>推薦產品</h2>
    <div class="product-list">
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p class="price">NT$ {{ product.price }}</p>
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
}

const products = ref<Product[]>([]);

onMounted(async () => {
  try {
    const res = await http.get('/products');
    products.value = res.data;   // 修正：直接取 res.data
    console.log('產品資料:', products.value);
  } catch (error) {
    console.error('載入產品失敗', error);
  }
});
</script>

<style scoped>
.products { padding: 2rem; }
.product-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 1.5rem; }
.product-card { background: white; border-radius: 24px; padding: 1.5rem; box-shadow: var(--shadow); }
.price { color: var(--accent); font-weight: bold; }
</style>