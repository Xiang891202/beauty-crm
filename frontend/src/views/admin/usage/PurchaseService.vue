<template>
  <div class="purchase-service-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>選擇服務</label>
        <select v-model="form.service_id" class="input" required>
          <option v-for="svc in services" :key="svc.id" :value="svc.id">
            {{ svc.name }} - {{ svc.price }} 元
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>購買次數</label>
        <input v-model.number="form.total_sessions" type="number" class="input" min="1" required />
      </div>

      <div class="form-group">
        <label>有效期限（可選）</label>
        <input v-model="form.expiry_date" type="date" class="input" />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn" :disabled="loading">購買</button>
        <button type="button" class="btn btn-outline" @click="emit('close')">取消</button>
      </div>

      <div v-if="message" :class="['message', { error: isError }]">{{ message }}</div>
    </form>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getServices } from '@/api/modules/service';
import { createMemberService } from '@/api/modules/member_service';

const props = defineProps<{ memberId: number }>();
const emit = defineEmits(['success', 'close']);

const services = ref<any[]>([]);
const form = ref({
  service_id: null as number | null,
  total_sessions: 1,
  expiry_date: '',
});
const loading = ref(false);
const message = ref('');
const isError = ref(false);

onMounted(async () => {
  try {
    const res = await getServices();
    if (res.success && Array.isArray(res.data)) {
      services.value = res.data;
    } else {
      services.value = [];
    }
  } catch (err) {
    console.error('加載服務失敗', err);
    message.value = '加載服務列表失敗';
    isError.value = true;
  }
});

const handleSubmit = async () => {
  if (!form.value.service_id) {
    message.value = '請選擇服務';
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const payload = {
      customer_id: props.memberId,
      service_id: form.value.service_id,
      total_sessions: form.value.total_sessions,
      expiry_date: form.value.expiry_date || undefined,
    };
    const res = await createMemberService(payload);
    emit('success', res.data);
    message.value = '購買成功！';
    form.value = { service_id: null, total_sessions: 1, expiry_date: '' };
  } catch (err: any) {
    console.error(err);
    message.value = err.response?.data?.error || '購買失敗，請稍後再試';
    isError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<!-- <style scoped>
.actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.message {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
}
.message.error {
  background-color: #fee;
  color: #c00;
}
</style> -->