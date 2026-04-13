<template>
  <div class="signature-container">
    <canvas
      ref="canvas"
      class="signature-canvas"
      width="400"
      height="200"
    />
    <div class="signature-actions">
      <BaseButton @click="clear">清除</BaseButton>
      <BaseButton @click="save">確認</BaseButton>
      <!-- <BaseButton variant="outline" @click="emit('close')">取消</BaseButton> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SignaturePad from 'signature_pad'
import BaseButton from '@/components/common/BaseButton.vue';

const canvas = ref<HTMLCanvasElement | null>(null)
let pad: SignaturePad | null = null

onMounted(() => {
  if (canvas.value) {
    // 确保 Canvas 的实际像素尺寸与属性一致（防止 CSS 缩放）
    const canvasEl = canvas.value
    const container = canvasEl.parentElement
    if (container) {
      // 可选：让 Canvas 适应容器宽度，但保持宽高比
      const containerWidth = container.clientWidth
      if (containerWidth > 0 && containerWidth < 400) {
        canvasEl.width = containerWidth
        canvasEl.height = containerWidth * 0.5
      }
    }

    pad = new SignaturePad(canvasEl, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7,
      minWidth: 0.5,
      maxWidth: 2.5,
      throttle: 16, // 提高触摸流畅度
    })

    // 针对触控笔优化
    canvasEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen') {
        if (pad) pad.penColor = 'rgb(0, 0, 255)'
      }
    })

    // 清除时重新调整尺寸（可选）
    const originalClear = pad.clear.bind(pad)
    pad.clear = () => {
      originalClear()
      // 重绘背景
      const ctx = canvasEl.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'rgb(255, 255, 255)'
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
      }
    }
  }
})

const clear = () => pad?.clear()
const save = () => {
  console.log('save 被調用, pad:', pad, 'isEmpty:', pad?.isEmpty());
  if (pad && !pad.isEmpty()) {
    const signatureData = pad.toDataURL();
    console.log('簽名資料長度:', signatureData.length);
    emit('save', signatureData);
  } else {
    alert('請先簽名');
  }
};

const emit = defineEmits<{ (e: 'save', data: string): void }>()
// const close = () => emit('close');
// const emit = defineEmits<{
//   (e: 'success'): void;
//   (e: 'close'): void;
// }>();
</script>

<style scoped>
.signature-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature-canvas {
  touch-action: none;          /* 禁止触摸时滚动/缩放 */
  user-select: none;           /* 避免选中 */
  -webkit-tap-highlight-color: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  width: 100%;
  height: auto;                /* 保持比例，实际像素由 width/height 属性控制 */
  cursor: crosshair;
}

.signature-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 768px) {
  .signature-canvas {
    min-height: 150px;         /* 手机上有足够绘制区域 */
  }
}
</style>