<!-- frontend/src/views/admin/signature/FullSignature.vue -->
<template>
  <div class="full-signature-overlay">
    <div class="full-signature-content">
      <h2 class="signature-title">請簽名</h2>
      <canvas ref="canvas" class="full-canvas" />
      <div class="full-signature-actions">
        <BaseButton @click="handleBack">回前頁</BaseButton>
        <BaseButton @click="handleClear">清除</BaseButton>
        <BaseButton @click="handleConfirm">確認</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import SignaturePadLib from 'signature_pad'
import { useSignatureStore } from '@/stores/signature.store'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const signatureStore = useSignatureStore()

const canvas = ref<HTMLCanvasElement | null>(null)
let pad: SignaturePadLib | null = null

// 修正：動態設定 canvas 解析度等於實際顯示大小
const resizeCanvas = () => {
  if (!canvas.value) return
  const container = canvas.value.parentElement!
  const rect = container.getBoundingClientRect()
  // 設定 canvas 像素尺寸 = 容器寬度，高度按比例或最大 80vh
  const w = rect.width
  const h = Math.min(w * 0.6, window.innerHeight * 0.7)
  canvas.value.width = w
  canvas.value.height = h
  // 若已有 pad 實例，直接更新；否則重新建立
  if (pad) {
    pad.clear()
  } else {
    pad = new SignaturePadLib(canvas.value, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7,
      minWidth: 0.5,
      maxWidth: 2.5,
      throttle: 16,
    })
  }
}

onMounted(async () => {
  await nextTick()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})

const handleClear = () => pad?.clear()
const handleConfirm = () => {
  if (!pad || pad.isEmpty()) {
    alert('請先簽名')
    return
  }
  const dataURL = pad.toDataURL()
  signatureStore.completeSignature(dataURL)
  router.back()
}
const handleBack = () => {
  signatureStore.cancelSignature()
  router.back()
}
</script>

<style scoped>
.full-signature-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.full-signature-content {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  width: 96vw;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.full-canvas {
  /* 不要設定 width/height，讓像素屬性決定顯示大小 */
  display: block;
  max-width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  touch-action: none;
}
.full-signature-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>