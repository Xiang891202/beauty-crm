<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">調整傳統服務包次數</h3>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <BaseInput
          v-model.number="form.delta"
          label="調整數量（正數增加，負數減少）"
          type="number"
          required
        />
        <BaseInput v-model="form.reason" label="調整原因" placeholder="例如：補償、扣回" />
        <BaseTextarea v-model="form.notes" label="備註" :rows="2" />
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="outline" @click="$emit('close')">取消</BaseButton>
          <BaseButton type="submit" :loading="loading">確認調整</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { createAdjustment } from '@/api/modules/adjustment';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  memberServiceId: number;
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const form = reactive({
  delta: 0,
  reason: '',
  notes: '',
});

const submit = async () => {
  if (form.delta === 0) {
    alert('請輸入非零的調整數量');
    return;
  }
  if (!props.memberServiceId) {
    alert('無效的服務包 ID');
    return;
  }
  loading.value = true;
  try {
    await createAdjustment({
      member_service_id: props.memberServiceId,
      adjustment_type: form.delta > 0 ? 'INCREASE' : 'DECREASE',
      amount: Math.abs(form.delta),
      reason: form.reason.trim() === '' ? '無原因' : form.reason,
    });
    emit('success');
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.error || '調整失敗');
  } finally {
    loading.value = false;
  }
};
</script>