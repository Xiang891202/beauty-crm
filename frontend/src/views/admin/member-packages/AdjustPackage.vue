<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">調整組合包總次數</h3>
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
import { adjustRemaining } from '@/api/modules/memberPackage';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  memberPackageId: string;
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
  if (form.delta === 0) return;
  loading.value = true;
  try {
    await adjustRemaining({
      member_package_id: props.memberPackageId,
      delta: form.delta,
      reason: form.reason,
      notes: form.notes,
    });
    emit('success');
  } catch (err: any) {
    alert(err.response?.data?.error || '調整失敗');
  } finally {
    loading.value = false;
  }
};
</script>