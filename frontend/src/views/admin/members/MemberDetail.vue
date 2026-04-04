<template>
  <div class="member-detail">
    <h2>會員詳細</h2>
    <div class="info-card">
      <p>會員 ID: {{ member.id }}</p>
      <p>姓名: {{ member.name }}</p>
      <p>電話: {{ member.phone || '-' }}</p>
    </div>

    <h3>服務包</h3>
    <ul class="service-list" v-if="activeServices.length">
      <li v-for="ms in activeServices" :key="ms.id">
        <div>
          <strong>授權 ID：{{ ms.id }}</strong> - {{ ms.service?.name || `服務 #${ms.service_id}` }} - 剩餘 {{ ms.remaining_sessions }} 次
        </div>
        <button class="btn btn-sm" @click="useService(ms.id)">使用服務</button>
      </li>
    </ul>
    <p v-else>暫無服務包</p>

    <div class="actions">
      <BaseButton @click="showPurchaseModal = true">購買新服務</BaseButton>
      <BaseButton @click="showUseService = true">使用服務</BaseButton>
    </div>

    <!-- 模态框部分保持不变 -->
    <BaseModal v-model="showUseService" title="使用服務">
      <UseService
        :member-id="Number(member.id)"
        :preselect-service-id="selectedServiceId"
        @success="onServiceUsed"
        @close="showUseService = false"
      />
    </BaseModal>

    <BaseModal v-model="showPurchaseModal" title="購買新服務">
      <PurchaseService
        :member-id="Number(member.id)"
        @success="onPurchaseSuccess"
        @close="showPurchaseModal = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getMember, getMemberServices, type Member } from '@/api/modules/member';
import UseService from '../usage/UseService.vue';
import PurchaseService from '../usage/PurchaseService.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const route = useRoute();
const member = ref<Member>({ id: 0, name: '', phone: null });
const memberServices = ref<any[]>([]);
const activeServices = computed(() => {
  return memberServices.value.filter(ms => ms.remaining_sessions > 0);
});
const showUseService = ref(false);
const showPurchaseModal = ref(false);
const selectedServiceId = ref<number | undefined>();

const loadMember = async () => {
  const id = Number(route.params.id);
  try {
    const res = await getMember(id);
    if (res.success) {
      member.value = res.data;
    }
  } catch (err) {
    console.error('載入會員失敗', err);
  }
};

const loadServices = async () => {
  const id = Number(route.params.id);
  try {
    const res = await getMemberServices(id);
    if (res.success) {
      memberServices.value = res.data;
    }
  } catch (err) {
    console.error('載入服務包失敗', err);
  }
};

const onServiceUsed = () => {
  showUseService.value = false;
  loadServices();
  selectedServiceId.value = undefined;
};

const onPurchaseSuccess = () => {
  showPurchaseModal.value = false;
  loadServices();
};

const useService = (memberServiceId: number) => {
  selectedServiceId.value = memberServiceId;
  showUseService.value = true;
};

onMounted(() => {
  loadMember();
  loadServices();
});
</script>

<!-- <style scoped>
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style> -->