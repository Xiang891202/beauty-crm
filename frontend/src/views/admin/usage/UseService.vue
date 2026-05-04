<!-- frontend/src/views/admin/usage/UseService.vue -->
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

      <!-- 签名区域 – 灰色触发框 -->
      <div class="form-group">
        <label>簽名（必填）</label>
        <div class="signature-trigger" @click="openFullSignature">
          <div class="signature-line" :class="{ 'has-signature': !!signatureUrl }">
            <img v-if="signatureUrl" :src="signatureUrl" class="signature-preview" />
            <span v-else class="signature-placeholder">點擊此處進行簽名</span>
          </div>
        </div>
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
import { ref, onMounted, onActivated } from 'vue';
import { createUsage } from '@/api/modules/usage';
import { getMemberServices } from '@/api/modules/member';
import { useRouter } from 'vue-router'
import { useSignatureStore } from '@/stores/signature.store'

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

const router = useRouter()
const signatureStore = useSignatureStore()

const memberServices = ref<MemberService[]>([]);
const selectedMemberServiceId = ref<number | null>(null);
const loading = ref(false);
const message = ref('');
const isError = ref(false);

// 用于显示灰色框内的签名预览
const signatureUrl = ref<string>('');

// 打开满版签名页
const openFullSignature = () => {
  signatureStore.startSignature({
    from: 'traditional',
    memberId: props.memberId,
    preselectServiceId: selectedMemberServiceId.value ?? undefined,
    serviceNotes: notes.value,
  })
  router.push('/admin/signature')
}

// 检查從满版签名返回的结果
const checkSignatureResult = () => {
  const { context, signature } = signatureStore.getResultAndClear()
  if (context && context.from === 'traditional') {
    if (signature) {
      signatureUrl.value = signature
    }
    if (context.serviceNotes) {
      notes.value = context.serviceNotes
    }
    if (context.preselectServiceId) {
      selectedMemberServiceId.value = context.preselectServiceId
    }
  }
}

// 将 base64 dataURL 转换为 File 对象（兼容后端 FormData 上传）
const dataURLtoFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

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

  if (!signatureUrl.value) {
    message.value = '請先簽名';
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const signatureFile = dataURLtoFile(signatureUrl.value, 'signature.png');
    const formData = new FormData();
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
    signatureUrl.value = '';  // 清空签名预览
  } catch (err: any) {
    console.error(err);
    message.value = err.response?.data?.error || '使用失敗，請稍後再試';
    isError.value = true;
  } finally {
    loading.value = false;
  }
};

// 载入会员服务
onMounted(async () => {
  try {
    const res = await getMemberServices(props.memberId);
    if (res.success && Array.isArray(res.data)) {
      memberServices.value = res.data.filter((ms: MemberService) => ms.remaining_sessions > 0);
    } else {
      memberServices.value = [];
    }
    if (memberServices.value.length === 0) {
      message.value = '此會員尚無有效服務方案';
      isError.value = true;
    }
    if (props.preselectServiceId && memberServices.value.length) {
      const found = memberServices.value.find(ms => ms.id === props.preselectServiceId);
      if (found) selectedMemberServiceId.value = found.id;
    }
  } catch (err) {
    console.error(err);
    message.value = '加載服務方案失敗';
    isError.value = true;
  }
  // 检查签名恢复
  checkSignatureResult();
});

// keep-alive 激活时也检查恢复
onActivated(() => {
  checkSignatureResult();
});
</script>

<style scoped>
/* 保留原有样式，仅添加签名相关样式 */
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
/* 原有样式保持不动 */
</style>