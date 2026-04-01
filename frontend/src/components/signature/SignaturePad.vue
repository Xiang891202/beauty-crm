<!-- components/signature/SignaturePad.vue -->
<template>
  <div class="signature-pad">
    <canvas ref="canvas" width="500" height="200" class="canvas"></canvas>
    <div class="toolbar">
      <button type="button" @click="clear">清除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
    canvas.value.addEventListener('mousedown', startDrawing);
    canvas.value.addEventListener('mousemove', draw);
    canvas.value.addEventListener('mouseup', stopDrawing);
    canvas.value.addEventListener('mouseleave', stopDrawing);
  }
});

const startDrawing = (e: MouseEvent) => {
  drawing = true;
  const rect = canvas.value!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx!.beginPath();
  ctx!.moveTo(x, y);
  ctx!.lineTo(x, y);
  ctx!.stroke();
};

const draw = (e: MouseEvent) => {
  if (!drawing) return;
  const rect = canvas.value!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx!.lineTo(x, y);
  ctx!.stroke();
  ctx!.beginPath();
  ctx!.moveTo(x, y);
};

const stopDrawing = () => { drawing = false; ctx!.beginPath(); };
const clear = () => {
  if (ctx && canvas.value) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  }
};
const getSignatureBlob = (): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.value!.toBlob((blob) => resolve(blob!));
  });
};
defineExpose({ clear, getSignatureBlob });
</script>

<style scoped>
.signature-pad {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.canvas {
  width: 100%;
  height: auto;
  background: white;
  border-radius: var(--radius);
  cursor: crosshair;
}
.toolbar {
  margin-top: 0.5rem;
  text-align: right;
}
</style>