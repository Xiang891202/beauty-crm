<template>
  <div class="signature-container">
    <!-- 觸發區域：灰色底線 + 預覽簽名 -->
    <div class="signature-trigger" @click="openModal">
      <span class="signature-label">簽名：</span>
      <div class="signature-line" :class="{ 'has-signature': !!savedSignature }">
        <img v-if="savedSignature" :src="savedSignature" class="signature-preview" />
      </div>
    </div>

    <!-- 滿版簽名模態框（傳送到 body） -->
    <Teleport to="body">
      <div v-if="showModal" class="signature-modal-overlay">
        <div class="signature-modal-content">
          <canvas
            ref="modalCanvas"
            class="modal-canvas"
            @touchstart.prevent
            @touchmove.prevent
          />
          <div class="modal-actions">
            <BaseButton variant="outline" @click="handleCancel">取消</BaseButton>
            <BaseButton @click="handleClear">清除</BaseButton>
            <BaseButton @click="handleConfirm">確認</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import SignaturePadLib from 'signature_pad'
import BaseButton from '@/components/common/BaseButton.vue'

const emit = defineEmits<{ (e: 'save', data: string): void }>()

// 狀態
const showModal = ref(false)
const savedSignature = ref<string | null>(null)

// 模態框元素參考
const modalCanvas = ref<HTMLCanvasElement | null>(null)
const modalPad = ref<SignaturePadLib | null>(null)

// 打開模態框
const openModal = () => {
  showModal.value = true
}

// 關閉模態框（不保存）
const handleCancel = () => {
  showModal.value = false
}

// 清除簽名
const handleClear = () => {
  modalPad.value?.clear()
}

// 確認簽名
const handleConfirm = () => {
  if (!modalPad.value || modalPad.value.isEmpty()) {
    alert('請先簽名')
    return
  }
  const dataURL = modalPad.value.toDataURL()
  savedSignature.value = dataURL
  emit('save', dataURL)
  showModal.value = false
}

// 監控模態框開啟，初始化簽名板
watch(showModal, async (val) => {
  if (val) {
    await nextTick()
    const canvasEl = modalCanvas.value
    if (canvasEl) {
      // 設定滿版尺寸（占視窗 90% 寬、70% 高，可依需求調整）
      canvasEl.width = window.innerWidth * 0.9
      canvasEl.height = window.innerHeight * 0.7
      modalPad.value = new SignaturePadLib(canvasEl, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        velocityFilterWeight: 0.7,
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16,
      })
    }
  } else {
    // 關閉時清除簽名板實例（下次打開重新建立）
    modalPad.value = null
  }
})
</script>

<style scoped>
/* 外層容器 */
.signature-container {
  width: 100%;
}

/* 觸發區域：灰色底線 */
.signature-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.signature-label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.signature-line {
  flex: 1;
  min-height: 40px;
  border-bottom: 2px dashed #aaa;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.signature-line.has-signature {
  border-bottom: none; /* 有簽名時隱藏底線 */
}

.signature-preview {
  max-height: 80px;
  max-width: 100%;
  object-fit: contain;
  background: white;
}

/* 滿版模態框 */
.signature-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-modal-content {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  width: 95vw;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-canvas {
  width: 100%;
  height: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  touch-action: none; /* 防止觸控時捲動 */
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>