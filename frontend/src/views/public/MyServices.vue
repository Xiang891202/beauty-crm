<template>
  <div class="my-services">
    <h2>我的服務</h2>

    <!-- 傳統服務包區塊 -->
    <h3>傳統服務包</h3>
    <div v-if="loadingServices" class="loading">載入中...</div>
    <div v-else-if="services.length === 0" class="empty">暫無傳統服務包</div>
    <div v-else class="service-grid">
      <div v-for="svc in services" :key="svc.id" class="service-card">
        <h3>{{ svc.service.name }}</h3>
        <p>剩餘次數：{{ svc.remaining_sessions }}</p>
        <p>購買日期：{{ formatDate(svc.purchased_at) }}</p>
      </div>
    </div>

    <!-- 組合包區塊 -->
    <h3>組合包</h3>
    <div v-if="loadingPackages" class="loading">載入中...</div>
    <div v-else-if="packages.length === 0" class="empty">暫無組合包</div>
    <div v-else class="service-grid">
      <div v-for="pkg in packages" :key="pkg.id" class="service-card">
        <h3>{{ pkg.snapshot_name }}</h3>
        <p>剩餘總次數：{{ pkg.remaining_uses }}</p>
        <p>購買日期：{{ formatDate(pkg.purchase_date) }}</p>
        <div v-if="pkg.snapshot_items?.length" class="package-items">
          <small>包含項目：</small>
          <ul>
            <li v-for="item in pkg.snapshot_items" :key="item.service_id">
              {{ item.service?.name || `服務 #${item.service_id}` }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyServices } from '@/api/modules/service';
import { getMyPackages } from '@/api/modules/memberPackage';

const services = ref<any[]>([]);
const packages = ref<any[]>([]);
const loadingServices = ref(false);
const loadingPackages = ref(false);

const fetchServices = async () => {
  loadingServices.value = true;
  try {
    const res = await getMyServices();
    if (res.success && Array.isArray(res.data)) services.value = res.data;
    else services.value = [];
  } catch (err) {
    console.error('取得傳統服務包失敗', err);
    services.value = [];
  } finally {
    loadingServices.value = false;
  }
};

const fetchPackages = async () => {
  loadingPackages.value = true;
  try {
    const res = await getMyPackages();
    if (res.success && Array.isArray(res.data)) packages.value = res.data;
    else packages.value = [];
  } catch (err) {
    console.error('取得組合包失敗', err);
    packages.value = [];
  } finally {
    loadingPackages.value = false;
  }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();

onMounted(() => {
  fetchServices();
  fetchPackages();
});
</script>

<!-- <style scoped>
/* 原有的樣式保留，可微調 */
.my-services {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}
.service-card {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.service-card h3 {
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.package-items {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}
.package-items ul {
  margin: 0.25rem 0 0 1rem;
}
.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}
</style> -->