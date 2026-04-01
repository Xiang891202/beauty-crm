<template>
  <div>
    <h2>使用記錄管理</h2>

    <!-- 篩選列 -->
    <div class="filters">
      <input v-model="filters.customer_id" type="number" placeholder="客戶 ID" />
      <input v-model="filters.service_id" type="number" placeholder="服務 ID" />
      <input v-model="filters.startDate" type="date" placeholder="開始日期" />
      <input v-model="filters.endDate" type="date" placeholder="結束日期" />
      <button @click="fetchLogs">查詢</button>
      <button @click="resetFilters">重置</button>
    </div>

    <!-- 表格 -->
    <table class="log-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>客戶</th>
          <th>服務包</th>
          <th>服務項目</th>
          <th>使用時間</th>
          <th>備註</th>
          <th>簽名</th>
          <th>建立者</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.id }}</td>
          <td>{{ log.customer?.name || `客戶 ${log.customer_id}` }} ({{ log.customer_id }})</td>
          <td>
            {{ log.member_service?.service?.name || `服務包 ${log.member_service_id}` }}
            ({{ log.member_service_id }})
          </td>
          <td>{{ log.service?.name || `服務 ${log.service_id}` }} ({{ log.service_id }})</td>
          <td>{{ formatDate(log.used_at) }}</td>
          <td>{{ log.notes || '-' }}</td>
          <td>
            <a v-if="log.signature_url" :href="log.signature_url" target="_blank">檢視</a>
            <span v-else>-</span>
          </td>
          <td>{{ log.users?.email || `管理員 ${log.created_by}` }} ({{ log.created_by }})</td>
        </tr>
      </tbody>
    </table>

    <!-- 分頁 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 1" @click="page--">上一頁</button>
      <span>第 {{ page }} 頁 / 共 {{ totalPages }} 頁</span>
      <button :disabled="page === totalPages" @click="page++">下一頁</button>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getUsageList } from '@/api/modules/usage';

const logs = ref([]);
const loading = ref(false);
const error = ref('');

const filters = ref({
  customer_id: '',
  service_id: '',
  startDate: '',
  endDate: '',
});
const page = ref(1);
const limit = 10;
const totalPages = ref(1);

const fetchLogs = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params = {
      ...filters.value,
      page: page.value,
      limit,
    };
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key];
    });
    const res = await getUsageList(params);
    if (res.success && res.data) {
      logs.value = res.data.items || [];
      totalPages.value = Math.ceil((res.data.total || 0) / limit);
    } else {
      logs.value = [];
    }
  } catch (err) {
    console.error(err);
    error.value = err?.response?.data?.error || '載入失敗';
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { customer_id: '', service_id: '', startDate: '', endDate: '' };
  page.value = 1;
  fetchLogs();
};

// ✅ 定義 formatDate 函數
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

watch(page, fetchLogs);
fetchLogs();
</script>

<style scoped>
.filters {
  margin-bottom: 1rem;
}
.filters input {
  margin-right: 0.5rem;
  padding: 0.25rem;
}
.log-table {
  width: 100%;
  border-collapse: collapse;
}
.log-table th, .log-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}
.loading, .error {
  margin-top: 1rem;
}
.error {
  color: red;
}
</style>