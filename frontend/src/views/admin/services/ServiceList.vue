<template>
  <div>
    <div class="header">
      <h2>服務管理</h2>
      <button @click="showForm = true">新增服務</button>
    </div>

    <!-- 服务列表表格 -->
    <table class="service-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名稱</th>
          <th>價格</th>
          <th>時長(分鐘)</th>
          <th>描述</th>
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
            <button @click="editService(service)">編輯</button>
            <button @click="deleteService(service.id)">刪除</button>
          </td>
        </tr>
        <tr v-if="services.length === 0">
          <td colspan="6">暫無服務資料</td>
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
            <input v-model.number="form.price" type="number" step="0.01" required />
          </div>
          <div>
            <label>時長(分鐘)</label>
            <input v-model.number="form.duration_minutes" type="number" required />
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
import { getServices, type Service } from '@/api/modules/service'; // 需先實現此 API
import http from '@/api/http';

const services = ref<Service[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref(false);
const form = ref<Partial<Service>>({ name: '', price: 0, duration_minutes: 60, description: null });

const loadServices = async () => {
  loading.value = true;
  try {
    const res = await getServices();
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

const submitForm = async () => {
  try {
    if (editing.value && form.value.id) {
      await http.put(`/services/${form.value.id}`, form.value);
    } else {
      await http.post('/services', form.value);
    }
    closeForm();
    loadServices();
  } catch (err) {
    console.error('儲存失敗', err);
  }
};

const editService = (service: Service) => {
  editing.value = true;
  form.value = { ...service };
  showForm.value = true;
};

const deleteService = async (id: number) => {
  if (!confirm('確定刪除此服務嗎？')) return;
  try {
    await http.delete(`/services/${id}`);
    loadServices();
  } catch (err) {
    console.error('刪除失敗', err);
  }
};

const closeForm = () => {
  showForm.value = false;
  editing.value = false;
  form.value = { name: '', price: 0, duration_minutes: 60, description: null };
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
</style>