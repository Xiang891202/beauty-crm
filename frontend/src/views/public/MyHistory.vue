<template>
  <div class="my-history">
    <h2>歷史購買</h2>

    <!-- 傳統服務包區塊 -->
    <h3>傳統課程（已用完）</h3>
    <div v-if="loadingServices" class="loading">載入中...</div>
    <div v-else-if="services.length === 0" class="empty">暫無歷史紀錄</div>
    <div v-else class="service-grid">
      <div v-for="svc in services" :key="svc.id" class="service-card used">
        <h3>{{ svc.service.name }}</h3>
        <!-- <p>總次數：{{ svc.total_sessions }}</p> -->
        <p>購買日期：{{ formatDate(svc.purchased_at) }}</p>
      </div>
    </div>

    <!-- 組合包區塊 -->
    <h3>組合包（已用完）</h3>
    <div v-if="loadingPackages" class="loading">載入中...</div>
    <div v-else-if="packages.length === 0" class="empty">暫無歷史紀錄</div>
    <div v-else class="service-grid">
      <div v-for="pkg in packages" :key="pkg.id" class="service-card used">
        <h3>{{ pkg.snapshot_name }}</h3>
        <!-- <p>總次數：{{ pkg.total_uses }}</p> -->
        <p>購買日期：{{ formatDate(pkg.purchase_date) }}</p>
        <div v-if="pkg.snapshot_items?.length" class="package-items">
          <small>包含項目：</small>
          <ul>
            <li v-for="item in pkg.snapshot_items" :key="item.service_id">
              {{ item.service_name || `服務 #${item.service_id}` }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import http from '@/api/http';

const services = ref<any[]>([]);
const packages = ref<any[]>([]);
const loadingServices = ref(false);
const loadingPackages = ref(false);

const fetchServices = async () => {
  loadingServices.value = true;
  try {
    const res = await http.get('/member-services/customers/me/member-services/used');
    if (res.success && Array.isArray(res.data)) {
      services.value = res.data;
    } else if (Array.isArray(res)) {
      services.value = res;
    } else {
      services.value = [];
    }
  } catch (err) {
    console.error(err);
    services.value = [];
  } finally {
    loadingServices.value = false;
  }
};

const fetchPackages = async () => {
  loadingPackages.value = true;
  try {
    const res = await http.get('/admin/member-packages/my/packages/used');
    // http 攔截器已解包，res 直接是 { success, data }
    if (res.success && Array.isArray(res.data)) {
      packages.value = res.data;
    } else if (Array.isArray(res)) {
      // 如果攔截器回傳的是陣列本身
      packages.value = res;
    } else {
      packages.value = [];
    }
  } catch (err) {
    console.error(err);
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

<style scoped>
.my-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
h2 { text-align: center; color: var(--accent); margin-bottom: 1.5rem; }
h3 { color: #666; margin: 1.5rem 0 0.5rem; }
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.service-card {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.package-items {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}
.package-items ul {
  margin: 0.25rem 0 0 1rem;
}
.service-card.used { opacity: 0.6; }
.loading, .empty { text-align: center; padding: 2rem; color: var(--text-light); }
</style>