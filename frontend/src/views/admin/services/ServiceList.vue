<template>
  <div>
    <div class="header">
      <h2>服務管理</h2>
      <label>
        <input type="checkbox" v-model="showDeleted" @change="loadServices" /> 顯示已刪除
      </label>
      <button @click="showForm = true">新增服務</button>
    </div>

    <table class="service-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名稱</th>
          <th>價格</th>
          <th>時長(分鐘)</th>
          <th>描述</th>
          <th>狀態</th>
          <th>操作</th>
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
              <button @click="editService(service)">編輯</button>
              <button @click="softDelete(service.id)">軟刪除</button>
            </template>
            <template v-else>
              <button @click="restoreService(service.id)">恢復</button>
              <button @click="permanentDelete(service.id)">永久刪除</button>
            </template>
          </td>
        </tr>
        <tr v-if="services.length === 0">
          <td colspan="7">暫無服務資料</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增/编辑表单模态框 -->
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <h3>{{ editing ? '編輯服務' : '新增服務' }}</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>名稱</label>
            <input v-model="form.name" required />
          </div>
          <div>
            <label>價格</label>
            <input v-model.number="form.price" type="number" step="0.01" min="0.01" required />
          </div>
          <div>
            <label>時長(分鐘)</label>
            <input v-model.number="form.duration_minutes" type="number" required />
          </div>
          <div>
            <label>描述</label>
            <textarea v-model="form.description"></textarea>
          </div>
          <div>
            <label>服務圖片</label>
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
import { type Service } from '@/api/modules/service';
import http from '@/api/http';

// 擴充 Service 類型以包含 deleted_at
interface ServiceWithDeleted extends Service {
  deleted_at?: string | null;
}

const services = ref<ServiceWithDeleted[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const showDeleted = ref(false);

const form = ref<Partial<Service>>({
  name: '',
  price: 0,
  duration_minutes: 60,
  description: null,
  image_url: null,
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// 載入服務列表（根據 showDeleted 決定是否包含已刪除）
const loadServices = async () => {
  loading.value = true;
  try {
    const url = showDeleted.value ? '/services/admin/all' : '/services';
    const res = await http.get(url);
    if (res.success && Array.isArray(res.data)) {
      services.value = res.data;
    } else {
      services.value = [];
    }
  } catch (err) {
    console.error('加載服務失敗', err);
    services.value = [];
  } finally {
    loading.value = false;
  }
};

// 軟刪除
const softDelete = async (id: number) => {
  if (!confirm('軟刪除服務，客戶仍可在歷史紀錄中看到，前台不再顯示。確定嗎？')) return;
  try {
    await http.delete(`/services/${id}`);
    await loadServices();
  } catch (err) {
    console.error('軟刪除失敗', err);
  }
};

// 恢復
const restoreService = async (id: number) => {
  try {
    await http.post(`/services/${id}/restore`);
    await loadServices();
  } catch (err) {
    console.error('恢復失敗', err);
  }
};

// 永久刪除
const permanentDelete = async (id: number) => {
  if (!confirm('永久刪除將一併刪除圖片，且無法恢復。確定嗎？')) return;
  try {
    await http.delete(`/services/${id}/permanent`);
    await loadServices();
  } catch (err) {
    console.error('永久刪除失敗', err);
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
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
    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }

    let res;
    if (editing.value && form.value.id) {
      // 不要手動設定 Content-Type
      res = await http.put(`/services/${form.value.id}`, formData);
    } else {
      res = await http.post('/services', formData);
    }
    if (res.success) {
      closeForm();
      loadServices();
    } else {
      console.error('儲存失敗', res.error);
    }
  } catch (err) {
    console.error('儲存失敗', err);
  } finally {
    loading.value = false;
  }
};

const editService = (service: ServiceWithDeleted) => {
  editing.value = true;
  form.value = {
    id: service.id,
    name: service.name,
    price: service.price,
    duration_minutes: service.duration_minutes,
    description: service.description ?? null,
    image_url: service.image_url ?? null,
  };
  imagePreview.value = null;
  imageFile.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = {
    name: '',
    price: 0,
    duration_minutes: 60,
    description: null,
    image_url: null,
  };
  imageFile.value = null;
  imagePreview.value = null;
  loading.value = false;
};

onMounted(loadServices);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.service-table {
  width: 100%;
  border-collapse: collapse;
}
.service-table th, .service-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.service-table th {
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