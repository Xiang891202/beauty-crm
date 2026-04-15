<template>
  <div class="p-4">
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <!-- 組合包選擇 -->
        <div>
          <label class="block text-sm font-medium mb-1">選擇組合包</label>
          <select v-model="selectedPackageId" class="w-full border rounded p-2" required @change="onPackageChange">
            <option :value="null" disabled>請選擇組合包</option>
            <option v-for="pkg in memberPackages" :key="pkg.id" :value="pkg.id">
              {{ pkg.snapshot_name }} 
              <!-- (剩餘 {{ pkg.remaining_uses }} / {{ pkg.total_uses }} 次) -->
            </option>
          </select>
        </div>

        <!-- 所選組合包的品項（可多選） -->
        <div v-if="selectedPackage">
          <label class="block text-sm font-medium mb-2">選擇本次使用的服務項目（可複選）</label>
          <div v-for="item in selectedPackage.snapshot_items" :key="item.service_id" class="flex items-center gap-2 mb-1">
            <input type="checkbox" v-model="selectedServiceIds" :value="item.service_id" />
            <span>{{ item.service?.name || `服務 #${item.service_id}` }}</span>
            <!-- <span class="text-xs text-gray-500">（此組合包內含 {{ item.original_quantity }} 次）</span> -->
          </div>
        </div>
        
        <!-- 贈品區塊（可選） -->
        <div class="border-t pt-4">
            <label class="block text-sm font-medium mb-2">贈送禮品（可選）</label>
            <div v-for="(gift, idx) in form.gifts" :key="idx" class="flex gap-2 mb-2">
                <input v-model="gift.description" placeholder="禮品名稱" class="border rounded p-2 flex-1" />
                <!-- <input v-model="gift.notes" placeholder="備註" class="border rounded p-2 flex-1" /> -->
                <BaseButton type="button" variant="danger" size="sm" @click="removeGift(idx)">移除</BaseButton>
            </div>
            <BaseButton type="button" variant="outline" size="sm" @click="addGift">+ 新增贈品</BaseButton>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">備註</label>
          <textarea v-model="form.notes" class="w-full border rounded p-2" rows="2"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">簽名（必填）</label>
          <SignaturePad ref="signaturePadRef" @save="onSignatureSave" />
          <BaseButton variant="outline" @click="$emit('close')">取消</BaseButton>
        </div>
        

        <div class="flex justify-end gap-3 pt-4">
          <!-- <BaseButton type="submit" :loading="loading">確認使用</BaseButton> -->
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCustomerPackages, useService, type MemberPackage } from '@/api/modules/memberPackage';
import BaseButton from '@/components/common/BaseButton.vue';
import SignaturePad from '@/components/signature/SignaturePad.vue';

const props = defineProps<{
  customerId: number;   // 改為接收客戶 ID
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const memberPackages = ref<MemberPackage[]>([]);
const selectedPackageId = ref<string | null>(null);
const selectedPackage = ref<MemberPackage | null>(null);
const selectedServiceIds = ref<number[]>([]);
const onSignatureSave = (data: string) => {
  console.log('收到簽名資料，長度:', data.length);
  form.signature_url = data;
};

const form = reactive({
  notes: '',
  signature_url: '',
  gifts: [] as Array<{ description: string; notes?: string }>,
});

const addGift = () => {
  form.gifts.push({ description: '', notes: '' });
};
const removeGift = (idx: number) => {
  form.gifts.splice(idx, 1);
};

const loadPackages = async () => {
  const res = await getCustomerPackages(props.customerId);
  if (res.success) {
    memberPackages.value = res.data;
  }
};

const onPackageChange = () => {
  const pkg = memberPackages.value.find(p => p.id === selectedPackageId.value);
  selectedPackage.value = pkg || null;
  selectedServiceIds.value = []; // 重置選中的品項
};

const submit = async () => {
  if (!selectedPackageId.value) {
    alert('請選擇組合包');
    return;
  }
  if (selectedServiceIds.value.length === 0) {
    alert('請至少選擇一個服務項目');
    return;
  }
  if (!form.signature_url) {
    alert('請完成簽名');
    return;
  }
  loading.value = true;
  try {
    await useService({
      member_package_id: selectedPackageId.value,
      selected_service_ids: selectedServiceIds.value,
      notes: form.notes,
      signature_url: form.signature_url,
      gifts: form.gifts.filter(g => g.description.trim()),
    });
    emit('success');
  } catch (err: any) {
    alert(err.response?.data?.error || '扣次失敗');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPackages();
});
</script>