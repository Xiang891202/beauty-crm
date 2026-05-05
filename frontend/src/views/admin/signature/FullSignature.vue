<!-- frontend/src/views/admin/signature/FullSignature.vue -->
<template>
  <div class="full-signature-page">
    <!-- 滿版 Canvas，扣除底部按鈕列的高度 -->
    <canvas ref="canvas" class="full-canvas" />

    <!-- 底部固定按鈕列 -->
    <div class="full-signature-actions">
      <BaseButton @click="handleBack">回前頁</BaseButton>
      <BaseButton @click="handleClear">清除</BaseButton>
      <BaseButton @click="handleConfirm">確認</BaseButton>
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

// 動態設定 canvas 像素尺寸 = 實際可視區域（扣掉底部按鈕高度）
const resizeCanvas = () => {
  if (!canvas.value) return
  const actionBar = document.querySelector('.full-signature-actions')
  const actionHeight = actionBar ? actionBar.clientHeight : 60
  const w = window.innerWidth
  const h = window.innerHeight - actionHeight
  canvas.value.width = w
  canvas.value.height = h

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
/* 全螢幕純白背景 */
.full-signature-page {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

/* Canvas 佔滿整個可用空間 */
.full-canvas {
  flex: 1;
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  touch-action: none;
  cursor: crosshair;
}

/* 底部按鈕列 */
.full-signature-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}
</style>