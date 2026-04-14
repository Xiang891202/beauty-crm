<template>
  <div class="usage-list">
    <h1>使用紀錄總覽</h1>

    <!-- 篩選列 -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>客戶 ID</label>
        <input v-model="filters.customer_id" type="number" placeholder="客戶 ID" />
      </div>
      <div class="filter-group">
        <label>客戶姓名</label>
        <input v-model="filters.customer_name" placeholder="輸入姓名搜尋" />
      </div>
      <!-- <div class="filter-group">
        <label>開始日期</label>
        <input v-model="filters.startDate" type="date" />
      </div>
      <div class="filter-group">
        <label>結束日期</label>
        <input v-model="filters.endDate" type="date" />
      </div> -->
      <div class="filter-actions">
        <BaseButton @click="fetchLogs">查詢</BaseButton>
        <BaseButton variant="outline" @click="resetFilters">重置</BaseButton>
      </div>
    </div>

    <!-- 紀錄列表 -->
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="records.length === 0" class="empty">尚無使用紀錄</div>
    <div v-else class="records-list">
      <div v-for="item in records" :key="item.id" class="record-card">
        <div class="card-header">
        <div class="flex items-center gap-2 flex-wrap">
          <span :class="['type-badge', item.type]">{{ typeLabel(item.type) }}</span>
          <span class="customer-name">👤 {{ item.customer_name || '未知客戶' }}</span>
          <span class="occurred-at">{{ formatDate(item.occurred_at) }}</span>
        </div>
      </div>
        <div class="card-title">{{ item.title }}</div>
        <div class="card-description">{{ item.description }}</div>
        <div v-if="item.notes" class="card-notes">📝 備註：{{ item.notes }}</div>
        <div v-if="item.signature_url" class="signature-preview">
          <img :src="item.signature_url" alt="簽名" />
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="pagination">
      <BaseButton variant="outline" :disabled="page === 1" @click="page--">上一頁</BaseButton>
      <span>第 {{ page }} 頁 / 共 {{ totalPages }} 頁</span>
      <BaseButton variant="outline" :disabled="page === totalPages" @click="page++">下一頁</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getUsageList } from '@/api/modules/usage';
import BaseButton from '@/components/common/BaseButton.vue';
import { debounce } from 'lodash';

interface UnifiedRecord {
  id: string;
  type: 'traditional' | 'package' | 'gift';
  occurred_at: string;
  customer_name?: string;  
  title: string;
  description: string;
  notes: string | null;
  signature_url: string | null;
}

const records = ref<UnifiedRecord[]>([]);
const loading = ref(false);
const error = ref('');

const filters = ref({
  customer_id: '',
  customer_name: '',
  startDate: '',
  endDate: '',
});
const page = ref(1);
const limit = 10;
const totalPages = ref(1);

const typeLabel = (type: string) => {
  switch (type) {
    case 'traditional': return '📋 傳統服務';
    case 'package': return '📦 組合包';
    case 'gift': return '🎁 贈品兌換';
    default: return type;
  }
};

const fetchLogs = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: any = { page: page.value, limit, customer_name: filters.value.customer_name || undefined,  // 新增
     };
    if (filters.value.customer_id) params.customer_id = Number(filters.value.customer_id);
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res = await getUsageList(params);
    if (res.success && res.data) {
      records.value = res.data.items || [];
      const total = res.data.total || 0;
      totalPages.value = Math.ceil(total / limit);
    } else {
      records.value = [];
    }
  } catch (err: any) {
    console.error(err);
    error.value = err?.response?.data?.error || '載入失敗';
    records.value = [];
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { customer_id: '', startDate: '', endDate: '', customer_name: '' };
  page.value = 1;
  fetchLogs();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  // 若 dateStr 只包含日期（無時間），new Date() 會設為 UTC 00:00，顯示時可能變為前一天
  // 為避免時區問題，可先檢查是否包含時間
  if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // 只有日期，顯示日期即可
    return dateStr;
  }
  return date.toLocaleString('zh-TW', { hour12: false });
};

const debouncedFetch = debounce(() => {
  page.value = 1;
  fetchLogs();
}, 500);

watch(() => filters.value.customer_name, () => {
  debouncedFetch();
});

watch(page, fetchLogs);
fetchLogs();
</script>