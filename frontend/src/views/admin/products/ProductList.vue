<template>
  <div>
    <div class="header">
      <h2>商品管理</h2>
      <label class="checkbox-label">
        <input type="checkbox" v-model="showDeleted" @change="loadProducts" />
        顯示已刪除
      </label>
      <button class="btn" @click="openForm()">新增商品</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>名稱</th><th>價格</th><th>庫存</th><th>描述</th><th>狀態</th><th>操作</th>
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
                <button class="btn btn-sm" @click="openForm(product)">編輯</button>
                <button class="btn btn-sm btn-outline" @click="softDelete(product.id)">軟刪除</button>
              </template>
              <template v-else>
                <button class="btn btn-sm" @click="restoreProduct(product.id)">恢復</button>
                <button class="btn btn-sm btn-danger" @click="permanentDelete(product.id)">永久刪除</button>
              </template>
            </td>
          </tr>
          <tr v-if="products.length === 0"><td colspan="7">暫無商品資料</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯模態框 -->
    <BaseModal v-model="showForm" :title="editing ? '編輯商品' : '新增商品'">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>名稱 *</label>
          <input v-model="form.name" class="input" required />
        </div>
        <div class="form-group">
          <label>價格 *</label>
          <input v-model.number="form.price" type="number" step="0.01" class="input" required />
        </div>
        <div class="form-group">
          <label>庫存 *</label>
          <input v-model.number="form.stock" type="number" class="input" required />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" class="textarea" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>商品圖片</label>
          <input type="file" @change="onFileChange" accept="image/*" class="file-input" />
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" />
            <button type="button" class="btn btn-sm btn-outline" @click="clearImage">清除</button>
          </div>
          <div v-else-if="form.image_url" class="image-preview">
            <img :src="form.image_url" />
            <button type="button" class="btn btn-sm btn-outline" @click="clearImage">清除</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn" :disabled="loading">{{ loading ? '儲存中...' : '儲存' }}</button>
          <button type="button" class="btn btn-outline" @click="closeForm">取消</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Product } from '@/api/modules/product';
import http from '@/api/http';
import BaseModal from '@/components/common/BaseModal.vue';

interface ProductWithDeleted extends Product { deleted_at?: string | null; }

const products = ref<ProductWithDeleted[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const showDeleted = ref(false);

const form = ref<Partial<Product>>({
  name: '', price: 0, stock: 0, description: null, image_url: null,
});
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const loadProducts = async () => {
  loading.value = true;
  try {
    const url = showDeleted.value ? '/products/admin/all' : '/products';
    const res = await http.get(url);
    products.value = (res.success && Array.isArray(res.data)) ? res.data : [];
  } catch (err) {
    console.error('載入商品失敗', err);
    products.value = [];
  } finally { loading.value = false; }
};

const openForm = (product?: ProductWithDeleted) => {
  editing.value = !!product;
  if (product) {
    form.value = { ...product, description: product.description ?? null };
  } else {
    form.value = { name: '', price: 0, stock: 0, description: null, image_url: null };
  }
  imageFile.value = null;
  imagePreview.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = { name: '', price: 0, stock: 0, description: null, image_url: null };
  imageFile.value = null;
  imagePreview.value = null;
};

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  form.value.image_url = null;
};

const submitForm = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name || '');
    formData.append('price', String(form.value.price));
    formData.append('stock', String(form.value.stock));
    if (form.value.description) formData.append('description', form.value.description);
    if (imageFile.value) formData.append('image', imageFile.value);

    let res;
    if (editing.value && form.value.id) {
      res = await http.put(`/products/${form.value.id}`, formData);
    } else {
      res = await http.post('/products', formData);
    }
    if (res.success) {
      closeForm();
      await loadProducts();
    } else console.error('儲存失敗', res.error);
  } catch (err) { console.error('儲存失敗', err); }
  finally { loading.value = false; }
};

const softDelete = async (id: number) => {
  if (!confirm('軟刪除商品，客戶仍可在歷史紀錄中看到，前台不再顯示。確定嗎？')) return;
  try { await http.delete(`/products/${id}`); await loadProducts(); } 
  catch (err) { console.error('軟刪除失敗', err); }
};
const restoreProduct = async (id: number) => {
  try { await http.post(`/products/${id}/restore`); await loadProducts(); } 
  catch (err) { console.error('恢復失敗', err); }
};
const permanentDelete = async (id: number) => {
  if (!confirm('永久刪除將一併刪除圖片，且無法恢復。確定嗎？')) return;
  try { await http.delete(`/products/${id}/permanent`); await loadProducts(); } 
  catch (err) { console.error('永久刪除失敗', err); }
};

onMounted(loadProducts);
</script>

<!-- <style scoped>
/* 樣式與 ServiceList 相同，可複製 */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.checkbox-label { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: normal; cursor: pointer; }
.table-wrapper { overflow-x: auto; }
.deleted-badge { color: #999; font-style: italic; }
.active-badge { color: #4caf50; font-weight: bold; }
.image-preview { margin-top: 8px; }
.image-preview img { max-width: 200px; border-radius: 4px; border: 1px solid var(--border); }
.file-input { margin-top: 4px; }
</style> -->