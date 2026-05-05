<template>
  <div class="member-detail p-6">
    <h2 class="text-2xl font-bold mb-4">會員詳細</h2>
    <div class="info-card bg-gray-50 p-4 rounded mb-6">
      <p>會員 ID: {{ member.id }}</p>
      <p>姓名: {{ member.name }}</p>
      <p>電話: {{ member.phone || '-' }}</p>
    </div>

     <div class="actions flex gap-3 mt-6">
       <BaseButton @click="router.push(`/admin/member-packages/purchase?customer_id=${member.id}`)">購買組合包</BaseButton>
       <BaseButton size="sm" @click="usePackageService" style="color: white; background-color: #007bff;">使用組合包</BaseButton>
      <BaseButton @click="showPurchaseModal = true">購買傳統服務</BaseButton>
      <BaseButton @click="showUseService = true" style="color: white; background-color: #007bff;">使用傳統服務</BaseButton>
    </div>    

    <!-- 傳統服務包區塊 -->
    <h3 class="text-xl font-semibold mt-6 mb-3">傳統服務包</h3>
    <ul class="service-list space-y-2" v-if="activeServices.length">
      <li v-for="ms in activeServices" :key="ms.id" class="border p-3 rounded flex justify-between items-center">
        <div>
          <strong>授權 ID：{{ ms.id }}</strong> - {{ ms.service?.name || `服務 #${ms.service_id}` }} - 剩餘 {{ ms.remaining_sessions }} 次
        </div>
        <!-- <button class="btn btn-sm bg-blue-500 text-white px-3 py-1 rounded" @click="useService(ms.id)">使用服務</button> -->
        <div class="flex gap-2">
         <!-- <BaseButton size="sm" @click="usePackageService(pkg.id)">使用服務</BaseButton> -->
          <BaseButton size="sm" variant="outline" @click="adjustTraditionalService(ms.id)">調整次數</BaseButton>
         </div>
      </li>
    </ul>
    <p v-else class="text-gray-500">暫無傳統服務包</p>

    <!-- 組合包區塊 -->
    <h3 class="text-xl font-semibold mt-6 mb-3">組合包</h3>
    <div v-if="memberPackages.length" class="space-y-4">
      <div v-for="pkg in memberPackages" :key="pkg.id">
        <div class="flex justify-between items-start service-list space-y-2">
          <div>
            <strong>{{ pkg.snapshot_name }}</strong>
            <p class="text-sm text-gray-600">{{ pkg.snapshot_description }}</p>
            <p class="text-sm">剩餘總次數：{{ pkg.remaining_uses }} 
              <!-- / {{ pkg.total_uses }} -->
            </p>
            
            <!-- <p class="text-sm" v-if="pkg.expiry_date">有效期限：{{ formatDate(pkg.expiry_date) }}</p> -->
            <div class="mt-2">
              <p class="text-sm font-medium">包含服務項目：</p>
              <ul class="list-disc list-inside text-sm">
                <li v-for="item in pkg.snapshot_items" :key="item.service_id">
                  {{ item.service?.name || `服務 #${item.service_id}` }}
                  <!-- （此組合包內含 {{ item.original_quantity }} 次） -->
                </li>
              </ul>
            </div>
          </div>
          <div class="flex gap-2">
            <!-- <BaseButton size="sm" @click="usePackageService(pkg.id)">使用服務</BaseButton> -->
            <BaseButton size="sm" variant="outline" @click="adjustPackage(pkg.id)">調整次數</BaseButton>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500">暫無組合包</p>

    <!-- <div class="actions flex gap-3 mt-6">
      <BaseButton size="sm" @click="usePackageService">使用服務</BaseButton>
      <BaseButton @click="router.push(`/admin/member-packages/purchase?customer_id=${member.id}`)">購買組合包</BaseButton>
      <BaseButton @click="showPurchaseModal = true">購買傳統服務</BaseButton>
      <BaseButton @click="showUseService = true">使用傳統服務</BaseButton>
    </div> -->

    <!-- 傳統服務包調整彈窗 -->
    <BaseModal v-model="showAdjustTraditionalModal" title="調整傳統服務包次數">
      <AdjustTraditionalService
        :member-service-id="selectedTraditionalServiceId"
        @success="onTraditionalAdjustSuccess"
        @close="showAdjustTraditionalModal = false"
      />
    </BaseModal>

    <!-- 傳統服務使用彈窗 -->
    <BaseModal v-model="showUseService" title="使用服務">
      <UseService
        :member-id="Number(member.id)"
        :preselect-service-id="selectedServiceId"
        @success="onServiceUsed"
        @close="showUseService = false"
      />
    </BaseModal>

    <!-- 傳統服務購買彈窗 -->
    <BaseModal v-model="showPurchaseModal" title="購買新服務">
      <PurchaseService
        :member-id="Number(member.id)"
        @success="onPurchaseSuccess"
        @close="showPurchaseModal = false"
      />
    </BaseModal>

    <!-- 組合包調整彈窗 -->
    <BaseModal v-model="showAdjustPackageModal" title="調整組合包次數">
      <AdjustPackage
        :member-package-id="selectedAdjustPackageId"
        @success="onAdjustSuccess"
        @close="showAdjustPackageModal = false"
      />
    </BaseModal>

    <!-- 組合包使用彈窗 -->
    <BaseModal v-model="showUsePackageModal" title="使用組合包服務">
      <UsePackageService
        :customer-id="member.id"
        @success="onPackageServiceUsed"
        @close="showUsePackageModal = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMember, getMemberServices, type Member } from '@/api/modules/member';
import { getCustomerPackages, type MemberPackage } from '@/api/modules/memberPackage';
import UseService from '../usage/UseService.vue';
import PurchaseService from '../usage/PurchaseService.vue';
import UsePackageService from '../member-packages/UsePackageService.vue';
import AdjustPackage from '../member-packages/AdjustPackage.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import AdjustTraditionalService from '../member-packages/AdjustTraditionalService.vue';


const route = useRoute();
const router = useRouter();
const member = ref<Member>({ id: 0, name: '', phone: null });
const memberServices = ref<any[]>([]);
const memberPackages = ref<MemberPackage[]>([]);
const showAdjustTraditionalModal = ref(false);
const selectedTraditionalServiceId = ref<number>(0);


const activeServices = computed(() => {
  return memberServices.value.filter(ms => ms.remaining_sessions > 0);
});

const showUseService = ref(false);
const showPurchaseModal = ref(false);
const showUsePackageModal = ref(false);
const showAdjustPackageModal = ref(false);
const selectedServiceId = ref<number | undefined>();
const selectedMemberPackageId = ref<string>('');
const selectedAdjustPackageId = ref<string>('');

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
    console.error('載入傳統服務包失敗', err);
  }
};

const loadMemberPackages = async () => {
  const id = Number(route.params.id);
  try {
    const res = await getCustomerPackages(id);
    if (res.success) {
      memberPackages.value = res.data;
    }
  } catch (err) {
    console.error('載入組合包失敗', err);
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const adjustTraditionalService = (serviceId: number) => {
  selectedTraditionalServiceId.value = serviceId;
  showAdjustTraditionalModal.value = true;
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

const onPackageServiceUsed = () => {
  showUsePackageModal.value = false;
  loadMemberPackages();
};

const onAdjustSuccess = () => {
  showAdjustPackageModal.value = false;
  loadMemberPackages();
};

const useService = (memberServiceId: number) => {
  selectedServiceId.value = memberServiceId;
  showUseService.value = true;
};

const usePackageService = (packageId: string) => {
  selectedMemberPackageId.value = packageId;
  showUsePackageModal.value = true;
};

const adjustPackage = (packageId: string) => {
  selectedAdjustPackageId.value = packageId;
  showAdjustPackageModal.value = true;
};

const onTraditionalAdjustSuccess = () => {
  showAdjustTraditionalModal.value = false;
  loadServices(); // 重新載入傳統服務包列表
};

onMounted(() => {
  loadMember();
  loadServices();
  loadMemberPackages();
});
</script>