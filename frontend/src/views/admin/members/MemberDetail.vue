<template>
  <div>
    <h2>會員詳細</h2>
    <p>會員 ID: {{ member.id }}</p>
    <p>姓名: {{ member.name }}</p>
    <p>電話: {{ member.phone }}</p>

    <h3>服務包</h3>
    <ul v-if="activeServices.length">
      <li v-for="ms in activeServices" :key="ms.id">
        {{ ms.service?.name || `服務 #${ms.service_id}` }} - 剩餘 {{ ms.remaining_sessions }} 次
        <button @click="useService(ms.id)">使用服務</button>
      </li>
    </ul>
    <p v-else>暫無服務包</p>

    <div class="actions">
      <BaseButton @click="showPurchaseModal = true">購買新服務</BaseButton>
      <BaseButton @click="showUseService = true">使用服務</BaseButton>
    </div>

    <BaseModal v-model="showUseService" title="使用服務">
      <UseService
        :member-id="Number(member.id)"
        :preselect-service-id="selectedServiceId"
        @success="onServiceUsed"
        @close="showUseService = false"
      />
    </BaseModal>

    <!-- 购买服务模态框 -->
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
import { getMemberDetail, getMemberServices } from '@/api/modules/member';
import UseService from '../usage/UseService.vue';
import PurchaseService from '../usage/PurchaseService.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const route = useRoute();
const member = ref({ id: 0, name: '', phone: '' });
const memberServices = ref<any[]>([]);
//計算屬性 只顯示有效次數
const activeServices = computed(() => {
  return memberServices.value.filter(ms => ms.remaining_sessions > 0);
});
const showUseService = ref(false);
const showPurchaseModal = ref(false);
const selectedServiceId = ref<number | undefined>();

const loadMember = async () => {
  const id = Number(route.params.id);
  const res = await getMemberDetail(id);
  member.value = res.data.data;
};

const loadServices = async () => {
  const id = Number(route.params.id);
  const res = await getMemberServices(id);
  memberServices.value = res.data.data;
};

const onServiceUsed = () => {
  showUseService.value = false;
  loadServices(); // 重新加载服务包列表
  selectedServiceId.value = undefined;
};

const onPurchaseSuccess = () => {
  showPurchaseModal.value = false;
  loadServices(); // 刷新服务包列表
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

<style scoped>
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>