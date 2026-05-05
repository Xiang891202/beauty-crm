<template>
  <div class="usage-list">
    <h1>使用紀錄總覽</h1>

    <!-- 篩選列：僅客戶姓名 -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>客戶姓名</label>
        <input v-model="filters.customer_name" placeholder="輸入姓名搜尋" />
      </div>
      <div class="filter-actions">
        <BaseButton @click="fetchLogs">查詢</BaseButton>
        <BaseButton variant="outline" @click="resetFilters">重置</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="records.length === 0" class="empty">尚無使用紀錄</div>
    <div v-else class="records-list">
      <div v-for="item in records" :key="item.id" class="record-card">
        <div class="card-row">
          <div class="card-info">
            <div class="card-header">
              <span :class="['type-badge', item.type]">{{ typeLabel(item.type) }}</span>
              <span class="customer-name">👤 {{ item.customer_name || '未知客戶' }}</span>
              <span class="occurred-at">{{ formatDateTime(item.occurred_at) }}</span>
            </div>
            <div class="card-title">{{ item.title }}</div>
            <div class="service-items">
              📋 使用項目：{{ getServiceNames(item) }}
            </div>
            <div v-if="getGiftDescriptions(item).length" class="gift-items">
              🎁 贈品：{{ getGiftDescriptions(item).join('、') }}
            </div>
            <div class="card-notes">
              📝 備註：
              <span v-if="item.notes" class="notes-text">{{ item.notes }}</span>
              <span v-else class="notes-empty">無</span>
              <BaseButton size="sm" variant="outline" @click="openEditNotes(item)" style="font-size: 10px; background-color: #f0f0f0; color: black;">編輯</BaseButton>
            </div>
          </div>
          <div v-if="item.signature_url" class="card-signature">
            <img :src="item.signature_url" alt="簽名" @click="openSignatureModal(item.signature_url)" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <BaseButton variant="outline" :disabled="page === 1" @click="page--">上一頁</BaseButton>
      <span>第 {{ page }} 頁 / 共 {{ totalPages }} 頁</span>
      <BaseButton variant="outline" :disabled="page === totalPages" @click="page++">下一頁</BaseButton>
    </div>

    <!-- 編輯備註彈窗 -->
    <BaseModal v-model="showEditNotesModal" title="編輯備註">
      <form @submit.prevent="saveNotes">
        <div class="space-y-4">
          <BaseTextarea v-model="editNotesForm.notes" label="備註" :rows="3" />
          <div class="flex justify-end gap-3">
            <BaseButton variant="outline" @click="showEditNotesModal = false">取消</BaseButton>
            <BaseButton type="submit" :loading="notesSaving">儲存</BaseButton>
          </div>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getUsageList } from '@/api/modules/usage';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import http from '@/api/http';
import { debounce } from 'lodash';

interface UnifiedRecord {
  id: string;          // 例如 "trad_1", "pkg_100"
  type: 'traditional' | 'package' | 'gift';
  occurred_at: string;
  customer_name?: string;
  title: string;
  description: string;
  notes: string | null;
  signature_url: string | null;
  gifts?: Array<{ gift_description: string }>;
  raw?: any;
}

const records = ref<UnifiedRecord[]>([]);
const loading = ref(false);
const error = ref('');

const filters = ref({ customer_name: '' });
const page = ref(1);
const limit = 10;
const totalPages = ref(1);

// ---------- 備註編輯 ----------
const showEditNotesModal = ref(false);
const notesSaving = ref(false);
const editNotesForm = ref({ id: '', notes: '' });

const openEditNotes = (item: UnifiedRecord) => {
  // 從 id 中提取實際的記錄 ID（去掉前綴）
  const realId = item.id.startsWith('trad_')
    ? item.id.replace('trad_', '')
    : item.id.replace('pkg_', '');
  editNotesForm.value = { id: realId, notes: item.notes || '' };
  showEditNotesModal.value = true;
};

const saveNotes = async () => {
  notesSaving.value = true;
  try {
    await http.patch(`/service-logs/${editNotesForm.value.id}/notes`, {
      notes: editNotesForm.value.notes,
    });
    
    // ＝＝＝ 不重新載入列表，直接更新本地資料 ＝＝＝
    const updatedNotes = editNotesForm.value.notes;
    const recordIndex = records.value.findIndex(r => {
      const realId = r.id.startsWith('trad_')
        ? r.id.replace('trad_', '')
        : r.id.replace('pkg_', '');
      return realId === editNotesForm.value.id;
    });
    if (recordIndex !== -1) {
      records.value[recordIndex].notes = updatedNotes;
    }
    
    showEditNotesModal.value = false;
  } catch (err: any) {
    alert(err?.response?.data?.error || '更新失敗');
  } finally {
    notesSaving.value = false;
  }
};

// ---------- 其他輔助函數（保持原樣） ----------
const typeLabel = (type: string) => {
  switch (type) {
    case 'traditional': return '📋 傳統服務';
    case 'package': return '📦 組合包';
    case 'gift': return '🎁 贈品兌換';
    default: return type;
  }
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return new Date(dateStr).toLocaleString('zh-TW', { hour12: false });
};

const openSignatureModal = (url: string) => {
  if (!url) return;
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(`
      <html><head><title>簽名圖片</title></head>
      <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;">
        <img src="${url.replace(/"/g, '&quot;')}" style="max-width:100%;max-height:100%;" />
      </body></html>
    `);
    w.document.close();
  }
};

const getServiceNames = (item: UnifiedRecord) => {
  if (item.raw?.items && Array.isArray(item.raw.items)) {
    return item.raw.items.map((i: any) => i.service?.name || `服務 #${i.service_id}`).join('、');
  }
  let desc = item.description;
  const giftIndex = desc.indexOf('；贈送禮品');
  if (giftIndex !== -1) desc = desc.substring(0, giftIndex);
  return desc.replace(/^使用項目：/, '');
};

const getGiftDescriptions = (item: UnifiedRecord): string[] => {
  if (item.gifts?.length) return item.gifts.map(g => g.gift_description);
  if (item.raw?.gifts) return item.raw.gifts.map((g: any) => g.gift_description);
  const match = item.description.match(/；贈送禮品：(.+)$/);
  if (match) return match[1].split('、');
  return [];
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getUsageList({ page: page.value, limit, customer_name: filters.value.customer_name || undefined });
    if (res.success && res.data) {
      records.value = res.data.items || [];
      totalPages.value = Math.ceil((res.data.total || 0) / limit);
    } else {
      records.value = [];
    }
  } catch (err: any) {
    error.value = err?.response?.data?.error || '載入失敗';
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value.customer_name = '';
  page.value = 1;
  fetchLogs();
};

const debouncedFetch = debounce(() => { page.value = 1; fetchLogs(); }, 500);
watch(() => filters.value.customer_name, () => debouncedFetch());
watch(page, fetchLogs);
fetchLogs();
</script>

<!-- 樣式保持原樣即可 -->

<style scoped>
/* 網格佈局：桌面三欄，手機一欄 */
.records-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.record-card {
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.record-card .card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  height: 100%;
}

.record-card .card-info {
  flex: 1;
  padding-right: 0.5rem;
}

.record-card .card-signature {
  flex-shrink: 0;
  width: 100px;
  height: 80px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
}

.record-card .card-signature img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .records-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .record-card .card-row {
    flex-direction: column;
  }
  .record-card .card-signature {
    width: 100%;
    height: auto;
    max-height: 120px;
  }
}

/* 篩選列樣式 */
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
  min-width: 200px;
}

.filter-group label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: var(--text-light);
}

.filter-group input {
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

/* 卡片內部其餘樣式 */
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
}
.type-badge.traditional { background: #e3f2fd; color: #1976d2; }
.type-badge.package { background: #e8f5e9; color: #2e7d32; }
.type-badge.gift { background: #f3e5f5; color: #7b1fa2; }
.customer-name, .occurred-at {
  font-size: 0.8rem;
  color: #666;
}
.card-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0.25rem 0;
}
.service-items, .gift-items {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}
.gift-items {
  color: #d48c5b;
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
/* 防止儲存按鈕在 loading 時尺寸變化 */
.base-button.loading {
  min-width: 60px;        /* 設定固定最小寬度 */
  padding: 0.5rem 1rem;   /* 與正常狀態一致 */
}
</style>