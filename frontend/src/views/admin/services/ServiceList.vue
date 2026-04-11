<template>
  <div>
    <div class="header">
      <h2>課程品項</h2>
      <label class="checkbox-label">
        <input type="checkbox" v-model="showDeleted" @change="loadServices" />
        顯示已刪除
      </label>
      <button class="btn" @click="openForm()">新增課程</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>名稱</th><th>價格</th><th>時長(分鐘)</th><th>描述</th><th>狀態</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.name }}</td>
            <td>{{ service.price }}</td>
            <td>{{ service.duration_minutes }}</td>
            <td>{{ service.description || '-' }}</td>
            <td>
              <span v-if="service.deleted_at" class="deleted-badge">已刪除</span>
              <span v-else class="active-badge">正常</span>
            </td>
            <td>
              <template v-if="!service.deleted_at">
                <button class="btn btn-sm" @click="openForm(service)">編輯</button>
                <button class="btn btn-sm btn-outline" @click="softDelete(service.id)">軟刪除</button>
              </template>
              <template v-else>
                <button class="btn btn-sm" @click="restoreService(service.id)">恢復</button>
                <button class="btn btn-sm btn-danger" @click="permanentDelete(service.id)">永久刪除</button>
              </template>
            </td>
          </tr>
          <tr v-if="services.length === 0"><td colspan="7">暫無服務資料</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯模態框 -->
    <BaseModal v-model="showForm" :title="editing ? '編輯服務' : '新增服務'">
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
          <label>時長(分鐘) *</label>
          <input v-model.number="form.duration_minutes" type="number" class="input" required />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" class="textarea" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>服務圖片</label>
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
import { type Service } from '@/api/modules/service';
import http from '@/api/http';
import BaseModal from '@/components/common/BaseModal.vue';

interface ServiceWithDeleted extends Service { deleted_at?: string | null; }

const services = ref<ServiceWithDeleted[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const showDeleted = ref(false);

const form = ref<Partial<Service>>({
  name: '', price: 0, duration_minutes: 60, description: null, image_url: null,
});
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const loadServices = async () => {
  loading.value = true;
  try {
    const url = showDeleted.value ? '/services/admin/all' : '/services';
    const res = await http.get(url);
    services.value = (res.success && Array.isArray(res.data)) ? res.data : [];
  } catch (err) {
    console.error('加載服務失敗', err);
    services.value = [];
  } finally { loading.value = false; }
};

const openForm = (service?: ServiceWithDeleted) => {
  editing.value = !!service;
  if (service) {
    form.value = { ...service, description: service.description ?? null };
  } else {
    form.value = { name: '', price: 0, duration_minutes: 60, description: null, image_url: null };
  }
  imageFile.value = null;
  imagePreview.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = { name: '', price: 0, duration_minutes: 60, description: null, image_url: null };
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
    formData.append('duration_minutes', String(form.value.duration_minutes));
    if (form.value.description) formData.append('description', form.value.description);
    if (imageFile.value) formData.append('image', imageFile.value);

    let res;
    if (editing.value && form.value.id) {
      res = await http.put(`/services/${form.value.id}`, formData);
    } else {
      res = await http.post('/services', formData);
    }
    if (res.success) {
      closeForm();
      await loadServices();
    } else console.error('儲存失敗', res.error);
  } catch (err) { console.error('儲存失敗', err); }
  finally { loading.value = false; }
};

const softDelete = async (id: number) => {
  if (!confirm('軟刪除服務，客戶仍可在歷史紀錄中看到，前台不再顯示。確定嗎？')) return;
  try { await http.delete(`/services/${id}`); await loadServices(); } 
  catch (err) { console.error('軟刪除失敗', err); }
};
const restoreService = async (id: number) => {
  try { await http.post(`/services/${id}/restore`); await loadServices(); } 
  catch (err) { console.error('恢復失敗', err); }
};
const permanentDelete = async (id: number) => {
  if (!confirm('永久刪除將一併刪除圖片，且無法恢復。確定嗎？')) return;
  try { await http.delete(`/services/${id}/permanent`); await loadServices(); } 
  catch (err) { console.error('永久刪除失敗', err); }
};

onMounted(loadServices);
</script>

<!-- <style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.checkbox-label { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: normal; cursor: pointer; }
.table-wrapper { overflow-x: auto; }
.deleted-badge { color: #999; font-style: italic; }
.active-badge { color: #4caf50; font-weight: bold; }
.image-preview { margin-top: 8px; }
.image-preview img { max-width: 200px; border-radius: 4px; border: 1px solid var(--border); }
.file-input { margin-top: 4px; }
</style> -->