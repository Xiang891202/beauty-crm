<template>
  <div class="my-logs">
    <h2>服務使用紀錄</h2>
    <div v-if="loading">載入中...</div>
    <div v-else-if="logs.length === 0" class="empty">尚無使用紀錄</div>
    <div v-else class="log-list">
      <div v-for="log in logs" :key="log.id" class="log-item">
        <div class="log-header">
          <strong>{{ log.service.name }}</strong>
          <span>{{ formatDate(log.used_at) }}</span>
        </div>
        <p>{{ log.notes || '無備註' }}</p>
        <a v-if="log.signature_url" :href="log.signature_url" target="_blank" class="signature-link">查看簽名</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyServiceLogs } from '@/api/modules/usage';

const logs = ref<any[]>([]);
const loading = ref(false);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getMyServiceLogs();
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

const formatDate = (date: string) => new Date(date).toLocaleDateString();

onMounted(fetchLogs);
</script>

<!-- <style scoped>
.my-logs {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.log-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.log-item {
  background: white;
  border-radius: 20px;
  padding: 1rem;
  border: 1px solid var(--border);
}
.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--accent);
}
.signature-link {
  color: var(--primary-dark);
  text-decoration: none;
  font-size: 0.9rem;
}
</style> -->