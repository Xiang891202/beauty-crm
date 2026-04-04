<template>
  <div class="my-services">
    <h2>我的療程包</h2>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="services.length === 0" class="empty">尚無服務包，請洽櫃檯購買</div>
    <div v-else class="service-grid">
      <div v-for="svc in services" :key="svc.id" class="service-card">
        <h3>{{ svc.service.name }}</h3>
        <p>剩餘次數：{{ svc.remaining_sessions }}</p>
        <p>購買日期：{{ formatDate(svc.purchased_at) }}</p>
        <!-- <BaseButton size="small" @click="useService(svc)">立即使用</BaseButton> -->
      </div>
    </div>

    <!-- 使用服務彈窗（含簽名） -->
    <BaseModal v-model="showUseModal" title="使用服務">
      <UseService
        :member-id="customerId"
        :preselect-service-id="selectedServiceId"
        @success="onServiceUsed"
        @close="showUseModal = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyServices } from '@/api/modules/service';
import UseService from '@/views/admin/usage/UseService.vue';
// import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const services = ref<any[]>([]);
const loading = ref(false);
const customerId = ref(0);
const showUseModal = ref(false);
const selectedServiceId = ref<number | undefined>();

const fetchServices = async () => {
  loading.value = true;
  try {
    const res = await getMyServices();
    if (res.success && Array.isArray(res.data)) {
      services.value = res.data;
    } else {
      services.value = [];
    }
    if (services.value.length) customerId.value = services.value[0].customer_id; // 假設同一會員的服務包 customer_id 一致
  } catch (err) {
    console.error('取得療程包失敗', err);
    services.value = [];
  } finally {
    loading.value = false;
  }
};

// const useService = (svc: any) => {
//   selectedServiceId.value = svc.id;
//   showUseModal.value = true;
// };

const onServiceUsed = () => {
  showUseModal.value = false;
  fetchServices(); // 刷新剩餘次數
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();

onMounted(fetchServices);
</script>

<!-- <style scoped>
.my-services {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
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
.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}
</style> -->