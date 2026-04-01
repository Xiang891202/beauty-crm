<template>
  <button :class="['base-button', { loading, outline }]" :disabled="loading">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ loading?: boolean; outline?: boolean }>();
</script>

<style scoped>
.base-button {
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}
.base-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}
.base-button.outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--accent);
}
.base-button.outline:hover {
  background: var(--secondary);
}
.base-button.loading {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>