<template>
  <div class="use-service-form">
    <form @submit.prevent="handleSubmit">
      <!-- 服务方案选择 -->
      <div class="form-group">
        <label>選擇服務方案</label>
        <select v-model="selectedMemberServiceId" class="input" required>
          <option v-for="ms in memberServices" :key="ms.id" :value="ms.id">
            {{ ms.service.name }}（剩餘 {{ ms.remaining_sessions }} 次）
          </option>
        </select>
      </div>

      <!-- 备注 -->
      <div class="form-group">
        <label>備註</label>
        <textarea v-model="notes" rows="3" class="textarea" placeholder="可選"></textarea>
      </div>

      <!-- 签名区域 -->
      <div class="form-group">
        <label>簽名</label>
        <canvas
          ref="signatureCanvas"
          width="400"
          height="200"
          class="signature-canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="startDrawingTouch"
          @touchmove="drawTouch"
          @touchend="stopDrawing"
          @touchcancel="stopDrawing"
        ></canvas>
        <button type="button" class="btn btn-outline btn-sm" @click="clearCanvas">清除簽名</button>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button type="submit" class="btn" :disabled="loading">送出使用</button>
        <button type="button" class="btn btn-outline" @click="emit('close')">取消</button>
      </div>

      <div v-if="message" :class="['message', { error: isError }]">{{ message }}</div>
    </form>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createUsage } from '@/api/modules/usage';
import { getMemberServices } from '@/api/modules/member';
import SignaturePad from '@/components/signature/SignaturePad.vue';

interface MemberService {
  id: number;
  service_id: number;
  remaining_sessions: number;
  service: {
    name: string;
  };
}

const notes = ref('');

const props = defineProps<{ memberId: number; preselectServiceId?: number }>();
const emit = defineEmits(['success', 'close']);

const memberServices = ref<MemberService[]>([]);
const selectedMemberServiceId = ref<number | null>(null);
const loading = ref(false);
const message = ref('');
const isError = ref(false);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;

onMounted(async () => {
  try {
    const res = await getMemberServices(props.memberId);
    // 修正：res 已是 { success, data }，data 是陣列
    if (res.success && Array.isArray(res.data)) {
      memberServices.value = res.data.filter((ms: MemberService) => ms.remaining_sessions > 0);
    } else {
      memberServices.value = [];
    }
    if (memberServices.value.length === 0) {
      message.value = '此會員尚無有效服務方案';
      isError.value = true;
    }
    // 预设选中
    if (props.preselectServiceId && memberServices.value.length) {
      const found = memberServices.value.find(ms => ms.id === props.preselectServiceId);
      if (found) selectedMemberServiceId.value = found.id;
    }
  } catch (err) {
    console.error(err);
    message.value = '加載服務方案失敗';
    isError.value = true;
  }
  // ... 繪圖初始化部分不變

  if (signatureCanvas.value) {
    ctx = signatureCanvas.value.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }
});

const startDrawing = (e: MouseEvent) => {
  if (!ctx || !signatureCanvas.value) return;
  drawing = true;
  const rect = signatureCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const draw = (e: MouseEvent) => {
  if (!drawing || !ctx || !signatureCanvas.value) return;
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
  if (ctx) ctx.beginPath();
};

const clearCanvas = () => {
  if (ctx && signatureCanvas.value) {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  }
};

const getSignatureFile = (): Promise<File> => {
  return new Promise((resolve) => {
    if (!signatureCanvas.value) {
      resolve(new File([], 'empty.png'));
      return;
    }
    signatureCanvas.value.toBlob((blob) => {
      const file = new File([blob!], 'signature.png', { type: 'image/png' });
      resolve(file);
    });
  });
};

const handleSubmit = async () => {
  if (!selectedMemberServiceId.value) {
    message.value = '請選擇服務方案';
    isError.value = true;
    return;
  }

  const selectedMs = memberServices.value.find(ms => ms.id === selectedMemberServiceId.value);
  if (!selectedMs) {
    message.value = '服務方案無效';
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const signatureFile = await getSignatureFile();
    const formData = new FormData(); // 在这里创建
    formData.append('member_service_id', String(selectedMemberServiceId.value));
    formData.append('customer_id', String(props.memberId));
    formData.append('service_id', String(selectedMs.service_id));
    formData.append('signature', signatureFile);
    if (notes.value.trim()) {
      formData.append('notes', notes.value);
    }

    const res = await createUsage(formData);
    const { remaining } = res.data;

    message.value = `使用成功！剩餘次數：${remaining}`;
    emit('success', { remaining });
    clearCanvas();
  } catch (err: any) {
    console.error(err);
    message.value = err.response?.data?.error || '使用失敗，請稍後再試';
    isError.value = true;
  } finally {
    loading.value = false;
  }
};

// 触摸开始
const startDrawingTouch = (e: TouchEvent) => {
  e.preventDefault(); // 阻止滚动
  if (!ctx || !signatureCanvas.value) return;
  const rect = signatureCanvas.value.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  drawing = true;
};

// 触摸移动
const drawTouch = (e: TouchEvent) => {
  e.preventDefault();
  if (!drawing || !ctx || !signatureCanvas.value) return;
  const rect = signatureCanvas.value.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
};
</script>

<!-- <style scoped>
/* 样式保持不变 */
</style> -->