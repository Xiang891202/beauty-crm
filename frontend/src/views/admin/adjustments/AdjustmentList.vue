<template>
  <div class="adjustment-list">
    <h1>人工補償記錄</h1>

    <!-- 篩選列（簡化，保留主要篩選） -->
    <div class="filters-bar">
      <!-- <div class="filter-group">
        <label>服務授權 ID</label>
        <input v-model="filters.member_service_id" type="number" placeholder="服務授權 ID" />
      </div> -->
      <div class="filter-group">
        <label>客戶姓名</label>
        <input v-model="filters.customer_name" placeholder="輸入姓名搜尋" />
      </div>
      <div class="filter-group">
        <label>調整類型</label>
        <select v-model="filters.adjustment_type" @change="loadAdjustments">
          <option value="">所有類型</option>
          <option value="INCREASE">增加</option>
          <option value="DECREASE">減少</option>
        </select>
      </div>

      <!-- <div class="filter-group">
        <label>結束日期</label>
        <input v-model="filters.endDate" type="date" />
      </div> -->
      <div class="filter-actions">
        <BaseButton @click="loadAdjustments">查詢</BaseButton>
        <BaseButton variant="outline" @click="resetFilters">重置</BaseButton>
        <!-- <BaseButton variant="primary" @click="showForm = true">新增補償</BaseButton> -->
      </div>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="adjustments.items.length === 0" class="empty">暫無調整記錄</div>
    <div v-else class="records-list">
      <div v-for="adj in adjustments.items" :key="adj.id" class="record-card">
        <div class="card-row">
          <div class="card-info">
            <div class="card-header">
              <span class="type-badge">{{ adj.adjustment_type === 'INCREASE' ? '增加' : '減少' }}</span>
              <span class="customer-name">👤 {{ adj.customer?.name || `客戶 ${adj.customer_id}` }}</span>
              <span class="occurred-at">{{ formatDate(adj.created_at) }}</span>
            </div>
            <div class="card-title">
              <span v-if="adj.member_package_id">組合包</span>
              <span v-else>傳統服務包</span>
            </div>
            <div class="card-description">
              <span v-if="adj.member_package_id">
                組合包：{{ adj.package_snapshot_name || adj.member_package_id }}
              </span>
              <span v-else>
                傳統服務包 ID：{{ adj.member_service_id }}
              </span>
            </div>
            <div class="adjust-detail">
              調整數量：{{ adj.amount }}
            </div>
            <div v-if="adj.reason" class="card-notes">
              📝 原因：{{ adj.reason }}
            </div>
          </div>
          <!-- 補償記錄通常無簽名，此處保留可選區域 -->
          <!-- <div v-if="adj.signature_url" class="card-signature">
            <img :src="adj.signature_url" alt="簽名" @click="openSignatureModal(adj.signature_url)" />
          </div> -->
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <BaseButton variant="outline" :disabled="page === 1" @click="page--">上一頁</BaseButton>
      <span>第 {{ page }} 頁 / 共 {{ totalPages }} 頁</span>
      <BaseButton variant="outline" :disabled="page === totalPages" @click="page++">下一頁</BaseButton>
    </div>

    <!-- 新增表單模態框（保持原有結構） -->
    <BaseModal v-model="showForm" title="新增人工補償">
      <form @submit.prevent="submitAdjustment">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">服務授權 ID</label>
            <input v-model.number="adjustForm.member_service_id" type="number" class="w-full border rounded p-2" required />
            <small class="text-xs text-gray-500">請輸入會員服務的 ID（可從會員詳情頁查看）</small>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">調整類型</label>
            <select v-model="adjustForm.adjustment_type" class="w-full border rounded p-2" required>
              <option value="INCREASE">增加次數</option>
              <option value="DECREASE">減少次數</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">數量</label>
            <input v-model.number="adjustForm.amount" type="number" class="w-full border rounded p-2" required min="1" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">原因</label>
            <textarea v-model="adjustForm.reason" class="w-full border rounded p-2" rows="2" required></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton variant="outline" type="button" @click="closeForm">取消</BaseButton>
            <BaseButton type="submit" :loading="loading">送出</BaseButton>
          </div>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getAdjustments, createAdjustment, type Adjustment } from '@/api/modules/adjustment';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const adjustments = ref<{ items: Adjustment[]; total: number }>({ items: [], total: 0 });
const loading = ref(false);
const page = ref(1);
const limit = 10;
const totalPages = ref(1);

const filters = ref({
  member_service_id: '',
  member_package_id: '',
  customer_name: '',
  adjustment_type: '',
  endDate: '',
});

const showForm = ref(false);
const adjustForm = ref({
  member_service_id: null as number | null,
  adjustment_type: 'INCREASE' as 'INCREASE' | 'DECREASE',
  amount: 1,
  reason: '',
});

const loadAdjustments = async () => {
  loading.value = true;
  try {
    const params: any = { page: page.value, limit };
    if (filters.value.customer_name) params.customer_name = filters.value.customer_name;
    // if (filters.value.member_service_id) params.member_service_id = filters.value.member_service_id;
    // if (filters.value.member_package_id) params.member_package_id = filters.value.member_package_id;
    if (filters.value.adjustment_type) params.adjustment_type = filters.value.adjustment_type;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res = await getAdjustments(params);
    if (res.success && res.data) {
      adjustments.value = {
        items: res.data.items || [],
        total: res.data.total || 0,
      };
      totalPages.value = Math.ceil(adjustments.value.total / limit);
    } else {
      adjustments.value = { items: [], total: 0 };
    }
  } catch (err) {
    console.error('加載調整記錄失敗', err);
    adjustments.value = { items: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { member_service_id: '', member_package_id: '', adjustment_type: '', endDate: '', customer_name: '' };
  page.value = 1;
  loadAdjustments();
};

const closeForm = () => {
  showForm.value = false;
  adjustForm.value = { member_service_id: null, adjustment_type: 'INCREASE', amount: 1, reason: '' };
};

const submitAdjustment = async () => {
  if (!adjustForm.value.member_service_id) {
    alert('請填寫服務授權 ID');
    return;
  }
  try {
    await createAdjustment({
      member_service_id: adjustForm.value.member_service_id,
      adjustment_type: adjustForm.value.adjustment_type,
      amount: adjustForm.value.amount,
      reason: adjustForm.value.reason,
    });
    closeForm();
    loadAdjustments();
  } catch (err: any) {
    alert(err.response?.data?.error || '操作失敗');
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-TW', { hour12: false });
};

const openSignatureModal = (url: string) => {
  if (url) window.open(url, '_blank');
};

watch(() => filters.value.adjustment_type, () => {
  page.value = 1;      // 重置頁碼
  loadAdjustments();
});

  watch(page, loadAdjustments);
  onMounted(loadAdjustments);
</script>

<style scoped>
/* 與 UsageList 相同的樣式 */
.adjustment-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}
.adjustment-list h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--accent);
}

/* 篩選列 */
.filters-bar {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}
.filter-group {
  flex: 1;
  min-width: 150px;
}
.filter-group label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: var(--text-light);
}
.filter-group input, .filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
}
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group, .filter-actions {
    width: 100%;
  }
}

/* 卡片網格 */
.records-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.record-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: all 0.2s;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.record-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  height: 100%;
}
.card-info {
  flex: 1;
  padding-right: 0.5rem;
}
.card-signature {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg);
  cursor: pointer;
}
.card-signature img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
@media (max-width: 768px) {
  .records-list {
    grid-template-columns: 1fr;
  }
  .card-row {
    flex-direction: column;
  }
  .card-signature {
    width: 100%;
    height: auto;
    max-height: 120px;
  }
}

/* 卡片內部元件 */
.card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.type-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  background: #e0e0e0;
  color: #333;
  font-weight: 500;
}
.customer-name, .occurred-at {
  font-size: 0.8rem;
  color: #666;
}
.card-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0.25rem 0;
}
.card-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}
.adjust-detail {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  margin-top: 0.25rem;
}
.card-notes {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #ddd;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}
</style>