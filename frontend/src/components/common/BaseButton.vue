<template>
  <button :class="['base-button', { loading }]" :disabled="loading" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ loading?: boolean }>();
defineEmits(['click']);
</script>

<style scoped>
.base-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.base-button.loading {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>