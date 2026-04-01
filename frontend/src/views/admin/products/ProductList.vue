<template>
  <div>
    <div class="header">
      <h2>商品管理</h2>
      <button @click="showForm = true">新增商品</button>
    </div>

    <table class="product-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名稱</th>
          <th>價格</th>
          <th>庫存</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.description || '-' }}</td>
          <td>
            <button @click="editProduct(product)">編輯</button>
            <button @click="deleteProduct(product.id)">刪除</button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="6">暫無商品資料</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增/编辑表单模态框 -->
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <h3>{{ editing ? '編輯商品' : '新增商品' }}</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>名稱</label>
            <input v-model="form.name" required />
          </div>
          <div>
            <label>價格</label>
            <input v-model.number="form.price" type="number" step="0.01" required />
          </div>
          <div>
            <label>庫存</label>
            <input v-model.number="form.stock" type="number" required />
          </div>
          <div>
            <label>描述</label>
            <textarea v-model="form.description"></textarea>
          </div>
          <div class="actions">
            <button type="submit">儲存</button>
            <button type="button" @click="closeForm">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProducts, type Product } from '@/api/modules/product'; // 需先實現
import http from '@/api/http';

const products = ref<Product[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const form = ref<Partial<Product>>({ name: '', price: 0, stock: 0, description: null });

const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await getProducts();
    if (res.success && Array.isArray(res.data)) {
      products.value = res.data;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('加載商品失敗', err);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 其餘函數類似 ServiceList
const submitForm = async () => {
  try {
    if (editing.value && form.value.id) {
      await http.put(`/products/${form.value.id}`, form.value);
    } else {
      await http.post('/products', form.value);
    }
    closeForm();
    loadProducts();
  } catch (err) {
    console.error('儲存失敗', err);
  }
};

const editProduct = (product: Product) => {
  editing.value = true;
  form.value = { ...product };
  showForm.value = true;
};

const deleteProduct = async (id: number) => {
  if (!confirm('確定刪除此商品嗎？')) return;
  try {
    await http.delete(`/products/${id}`);
    loadProducts();
  } catch (err) {
    console.error('刪除失敗', err);
  }
};

const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = { name: '', price: 0, stock: 0, description: null };
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
/* 复用服务管理的样式，可单独提取公共样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
}
.product-table th, .product-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.product-table th {
  background-color: #f2f2f2;
}
button {
  margin-right: 8px;
  padding: 4px 8px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
.modal-content input, .modal-content textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 6px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>