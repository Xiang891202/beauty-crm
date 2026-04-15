<template>
  <div class="my-logs">
    <h2>服務使用紀錄</h2>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="logs.length === 0" class="empty">尚無使用紀錄</div>
    <div v-else class="records-list">
      <div v-for="item in logs" :key="item.id" class="record-card">
        <div class="card-row">
          <div class="card-info">
            <div class="card-header">
              <span :class="['type-badge', item.type]">{{ typeLabel(item.type) }}</span>
              <span class="customer-name">👤 {{ item.customer_name || '未知客戶' }}</span>
              <span class="occurred-at">{{ formatDate(item.occurred_at || item.created_at || item.usage_date) }}</span>
            </div>
            <div class="card-title">{{ item.title || item.snapshot_package_name || '組合包' }}</div>
            <div class="service-items">
              📋 使用項目：{{ getServiceNames(item) }}
            </div>
            <div v-if="getGiftDescriptions(item).length" class="gift-items">
              🎁 贈品：{{ getGiftDescriptions(item).join('、') }}
            </div>
            <!-- <div v-if="item.notes" class="card-notes">
              📝 備註：{{ item.notes }}
            </div> -->
          </div>
          <div v-if="item.signature_url" class="card-signature">
            <img :src="item.signature_url" alt="簽名" @click="openSignature(item.signature_url)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyUsageLogs } from '@/api/modules/memberPackage';

const logs = ref<any[]>([]);
const loading = ref(false);

const typeLabel = (type: string) => {
  switch (type) {
    case 'traditional': return '📋 傳統服務';
    case 'package': return '📦 組合包';
    case 'gift': return '🎁 贈品兌換';
    default: return '組合包使用';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-TW', { hour12: false });
};

const getServiceNames = (item: any) => {
  if (item.items && item.items.length) {
    return item.items.map((i: any) => i.service?.name || `服務 #${i.service_id}`).join('、');
  }
  if (item.raw?.items) {
    return item.raw.items.map((i: any) => i.service?.name || `服務 #${i.service_id}`).join('、');
  }
  // 從 description 中提取（後備方案）
  let desc = item.description || '';
  const giftIndex = desc.indexOf('；贈送禮品');
  if (giftIndex !== -1) desc = desc.substring(0, giftIndex);
  return desc.replace(/^使用項目：/, '') || '未選擇項目';
};

const getGiftDescriptions = (item: any): string[] => {
  if (item.gifts && item.gifts.length) {
    return item.gifts.map((g: any) => g.gift_description);
  }
  if (item.raw?.gifts) {
    return item.raw.gifts.map((g: any) => g.gift_description);
  }
  const match = (item.description || '').match(/；贈送禮品：(.+)$/);
  if (match) return match[1].split('、');
  return [];
};

const openSignature = (url: string) => {
  window.open(url, '_blank');
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getMyUsageLogs();
    if (res.success && Array.isArray(res.data)) {
      logs.value = res.data;
    } else {
      logs.value = [];
    }
  } catch (err) {
    console.error('取得使用紀錄失敗', err);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);
</script>

<style scoped>
/* 與管理員 UsageList.vue 相同的卡片樣式 */
.my-logs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}
.my-logs h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--accent);
}

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
  width: 100px;
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

@media (max-width: 768px) {
  .records-list {
    grid-template-columns: 1fr;
    gap: 1rem;
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

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}
</style>