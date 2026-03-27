<template>
  <div>
    <canvas ref="canvas" width="400" height="200" style="border: 1px solid #ccc;"></canvas>
    <div>
      <button type="button" @click="clearCanvas">清除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
    }
  }
});

const clearCanvas = () => {
  if (ctx && canvas.value) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  }
};
</script>