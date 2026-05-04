<!-- frontend/src/views/admin/member-packages/UsePackageService.vue -->
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
            </option>
          </select>
        </div>

        <!-- 所選組合包的品項（可多選） -->
        <div v-if="selectedPackage">
          <label class="block text-sm font-medium mb-2">選擇本次使用的服務項目（可複選）</label>
          <div v-for="item in selectedPackage.snapshot_items" :key="item.service_id" class="flex items-center gap-2 mb-1">
            <input type="checkbox" v-model="selectedServiceIds" :value="item.service_id" />
            <span>{{ item.service?.name || `服務 #${item.service_id}` }}</span>
          </div>
        </div>
        
        <!-- 贈品區塊（可選） -->
        <div class="border-t pt-4">
            <label class="block text-sm font-medium mb-2">贈送禮品（可選）</label>
            <div v-for="(gift, idx) in form.gifts" :key="idx" class="flex gap-2 mb-2">
                <input v-model="gift.description" placeholder="禮品名稱" class="border rounded p-2 flex-1" />
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
          <!-- 灰色觸發區域 -->
          <div class="signature-trigger" @click="openFullSignature">
            <div class="signature-line" :class="{ 'has-signature': !!form.signature_url }">
              <img v-if="form.signature_url" :src="form.signature_url" class="signature-preview" />
              <span v-else class="signature-placeholder">點擊此處進行簽名</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton type="submit" :loading="loading">確認使用</BaseButton>
          <BaseButton variant="outline" @click="$emit('close')">取消</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue';
import { getCustomerPackages, useService, type MemberPackage } from '@/api/modules/memberPackage';
import BaseButton from '@/components/common/BaseButton.vue';
import { useRouter } from 'vue-router'
import { useSignatureStore } from '@/stores/signature.store'

const props = defineProps<{
  customerId: number;
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const router = useRouter()
const signatureStore = useSignatureStore()

const loading = ref(false);
const memberPackages = ref<MemberPackage[]>([]);
const selectedPackageId = ref<string | null>(null);
const selectedPackage = ref<MemberPackage | null>(null);
const selectedServiceIds = ref<number[]>([]);

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
  selectedServiceIds.value = [];
};

// 打開滿版簽名頁面
const openFullSignature = () => {
  // 將當前表單狀態暫存到 store
  signatureStore.startSignature({
    from: 'package',
    customerId: props.customerId,
    selectedPackageId: selectedPackageId.value ?? undefined,
    selectedServiceIds: [...selectedServiceIds.value],
    notes: form.notes,
    gifts: form.gifts,
  })
  router.push('/admin/signature')
}

// 檢查是否有從滿版簽名頁返回的結果
const checkSignatureResult = () => {
  const { context, signature } = signatureStore.getResultAndClear()
  if (context && context.from === 'package') {
    // 恢復簽名圖片
    if (signature) {
      form.signature_url = signature
    }
    // 恢復選取的組合包（如果還在選項列表中）
    if (context.selectedPackageId) {
      const exists = memberPackages.value.some(p => p.id === context.selectedPackageId)
      if (exists) {
        selectedPackageId.value = context.selectedPackageId!
        onPackageChange()
      }
    }
    // 恢復服務項目
    if (context.selectedServiceIds && context.selectedServiceIds.length > 0) {
      selectedServiceIds.value = [...context.selectedServiceIds]
    }
    // 恢復備註
    if (context.notes) {
      form.notes = context.notes
    }
    // 恢復贈品
    if (context.gifts && context.gifts.length > 0) {
      form.gifts = [...context.gifts]
    }
  }
}

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

// 組件掛載時載入套餐，並檢查簽名結果
onMounted(async () => {
  await loadPackages();
  // 只在有掛載時檢查，避免與 activated 重複
  if (!memberPackages.value.length) return;
  checkSignatureResult();
});

// 若使用了 keep-alive，則在 activated 時也檢查
onActivated(() => {
  checkSignatureResult();
});
</script>

<style scoped>
.signature-trigger {
  cursor: pointer;
}
.signature-line {
  min-height: 40px;
  border-bottom: 2px dashed #aaa;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}
.signature-line.has-signature {
  border-bottom: none;
}
.signature-preview {
  max-height: 80px;
  max-width: 100%;
  background: white;
}
.signature-placeholder {
  color: #999;
  font-size: 0.9rem;
}
</style>