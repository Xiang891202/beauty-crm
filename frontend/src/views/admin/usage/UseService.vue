<template>
  <div>
    <h2>使用服務</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>會員服務 ID (member_service_id)</label>
        <input v-model="form.member_service_id" type="number" required />
      </div>
      <div>
        <label>客戶 ID (customer_id)</label>
        <input v-model="form.customer_id" type="number" required />
      </div>
      <div>
        <label>簽名（可選）</label>
        <canvas
          ref="signatureCanvas"
          width="400"
          height="200"
          style="border:1px solid #ccc; background: white;"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
        ></canvas>
        <div>
          <button type="button" @click="clearCanvas">清除</button>
        </div>
      </div>
      <button type="submit" :disabled="loading">送出使用</button>
    </form>
    <div v-if="message" :class="['message', { error: isError }]">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createUsage } from '@/api/modules/usage';

const form = ref({
  member_service_id: '',
  customer_id: ''
});

const loading = ref(false);
const message = ref('');
const isError = ref(false);
const signatureCanvas = ref(null);
let ctx = null;
let drawing = false;

onMounted(() => {
  if (signatureCanvas.value) {
    ctx = signatureCanvas.value.getContext('2d');
    // 初始填充白色
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
});

const startDrawing = (e) => {
  drawing = true;
  const rect = signatureCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const draw = (e) => {
  if (!drawing) return;
  const rect = signatureCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const stopDrawing = () => {
  drawing = false;
  ctx.beginPath();
};

const clearCanvas = () => {
  if (ctx) {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  }
};

const getSignatureFile = () => {
  return new Promise((resolve) => {
    signatureCanvas.value.toBlob((blob) => {
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      resolve(file);
    });
  });
};

const handleSubmit = async () => {
  if (!form.value.member_service_id || !form.value.customer_id) {
    message.value = '請填寫會員服務 ID 和客戶 ID';
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const signatureFile = await getSignatureFile();
    const formData = new FormData();
    formData.append('member_service_id', form.value.member_service_id);
    formData.append('customer_id', form.value.customer_id);
    formData.append('signature', signatureFile);

    const res = await createUsage(formData);
    const { remaining } = res.data.data;

    message.value = `使用成功！剩餘次數：${remaining}`;
    form.value.member_service_id = '';
    form.value.customer_id = '';
    clearCanvas();
  } catch (err) {
    console.error(err);
    message.value = err.response?.data?.error || '使用失敗，請稍後再試';
    isError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.message {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}
.error {
  background-color: #ffebee;
  color: #c62828;
}
</style>