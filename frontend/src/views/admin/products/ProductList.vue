<template>
  <div>
    <div class="header">
      <h2>商品管理</h2>
      <label>
        <input type="checkbox" v-model="showDeleted" @change="loadProducts" /> 顯示已刪除
      </label>
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
          <th>狀態</th>
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
            <span v-if="product.deleted_at" class="deleted-badge">已刪除</span>
            <span v-else class="active-badge">正常</span>
          </td>
          <td>
            <template v-if="!product.deleted_at">
              <button @click="editProduct(product)">編輯</button>
              <button @click="softDelete(product.id)">軟刪除</button>
            </template>
            <template v-else>
              <button @click="restoreProduct(product.id)">恢復</button>
              <button @click="permanentDelete(product.id)">永久刪除</button>
            </template>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="7">暫無商品資料</td>
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
          <div>
            <label>商品圖片</label>
            <input type="file" @change="onFileChange" accept="image/*" />
            <div v-if="imagePreview" class="preview">
              <img :src="imagePreview" style="max-width: 200px; margin-top: 8px;" />
            </div>
            <div v-else-if="form.image_url" class="preview">
              <img :src="form.image_url" style="max-width: 200px; margin-top: 8px;" />
            </div>
          </div>
          <div class="actions">
            <button type="submit" :disabled="loading">
              {{ loading ? '儲存中...' : '儲存' }}
            </button>
            <button type="button" @click="closeForm">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {  type Product } from '@/api/modules/product';
import http from '@/api/http';

// 擴充 Product 類型以包含 deleted_at（若原類型沒有，此處補上）
interface ProductWithDeleted extends Product {
  deleted_at?: string | null;
}

const products = ref<ProductWithDeleted[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const showDeleted = ref(false); // ✅ 宣告 showDeleted

const form = ref<Partial<Product>>({
  name: '',
  price: 0,
  stock: 0,
  description: null,
  image_url: null,
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// 載入商品列表（根據 showDeleted 決定是否包含已刪除）
const loadProducts = async () => {
  loading.value = true;
  try {
    const url = showDeleted.value ? '/products/admin/all' : '/products';
    const res = await http.get(url);
    if (res.success) {
      products.value = res.data;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('載入商品失敗', err);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 軟刪除
const softDelete = async (id: number) => {
  if (!confirm('軟刪除商品，客戶仍可在歷史紀錄中看到，前台不再顯示。確定嗎？')) return;
  try {
    await http.delete(`/products/${id}`);
    await loadProducts();
  } catch (err) {
    console.error('軟刪除失敗', err);
  }
};

// 恢復
const restoreProduct = async (id: number) => {
  try {
    await http.post(`/products/${id}/restore`);
    await loadProducts();
  } catch (err) {
    console.error('恢復失敗', err);
  }
};

// 永久刪除
const permanentDelete = async (id: number) => {
  if (!confirm('永久刪除將一併刪除圖片，且無法恢復。確定嗎？')) return;
  try {
    await http.delete(`/products/${id}/permanent`);
    await loadProducts();
  } catch (err) {
    console.error('永久刪除失敗', err);
  }
};

// 圖片選擇
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  console.log('onFileChange 觸發，檔案:', file);
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    console.log('沒有選擇檔案');
  }
};

// 提交表單（新增/編輯）
const submitForm = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name || '');
    formData.append('price', String(form.value.price));
    formData.append('stock', String(form.value.stock));
    if (form.value.description) formData.append('description', form.value.description);
    if (imageFile.value) {
      formData.append('image', imageFile.value);
      console.log('附加圖片檔案:', imageFile.value.name);
    } else {
      console.log('沒有圖片檔案');
    }

    let res;
    if (editing.value && form.value.id) {
      res = await http.put(`/products/${form.value.id}`, formData);
    } else {
      res = await http.post('/products', formData);
    }
    if (res.success) {
      closeForm();
      loadProducts();
    } else {
      console.error('儲存失敗', res.error);
    }
  } catch (err) {
    console.error('儲存失敗', err);
  } finally {
    loading.value = false;
  }
};

// 編輯商品
const editProduct = (product: ProductWithDeleted) => {
  editing.value = true;
  form.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description ?? null,
    image_url: product.image_url ?? null,
  };
  imagePreview.value = null;
  imageFile.value = null;
  showForm.value = true;
};

// 關閉表單
const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = {
    name: '',
    price: 0,
    stock: 0,
    description: null,
    image_url: null,
  };
  imageFile.value = null;
  imagePreview.value = null;
  loading.value = false;
};

onMounted(loadProducts);
</script>

<style scoped>
/* 原有的樣式保持不變，新增以下狀態標籤樣式 */
.deleted-badge {
  color: #999;
  font-style: italic;
}
.active-badge {
  color: #4caf50;
  font-weight: bold;
}
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
.deleted-badge {
  color: #999;
  font-style: italic;
}
.active-badge {
  color: #4caf50;
  font-weight: bold;
}
</style>