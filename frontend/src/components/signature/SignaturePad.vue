<template>
  <div class="signature-container">
    <canvas ref="canvas" class="signature-canvas" />
    <div class="signature-actions">
      <BaseButton @click="clear">清除</BaseButton>
      <BaseButton @click="save">確認</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SignaturePad from 'signature_pad'

const canvas = ref<HTMLCanvasElement | null>(null)
let pad: SignaturePad | null = null

onMounted(() => {
  if (canvas.value) {
    pad = new SignaturePad(canvas.value, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7, // 支援壓感（部分觸控筆）
      minWidth: 0.5,
      maxWidth: 2.5
    })
    // 針對觸控筆優化
    canvas.value.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen') {
        pad!.penColor = 'rgb(0, 0, 255)' // 可變換顏色區分
      }
    })
  }
})

const clear = () => pad?.clear()
const save = () => {
  if (pad && !pad.isEmpty()) {
    const signatureData = pad.toDataURL()
    // 透過 emit 傳回上層
    emit('save', signatureData)
  } else {
    alert('請先簽名')
  }
}

const emit = defineEmits<{ (e: 'save', data: string): void }>()
</script>

