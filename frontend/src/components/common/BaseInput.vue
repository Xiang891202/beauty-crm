<template>
  <div class="base-input" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const id = computed(() => `input-${Math.random().toString(36).substr(2, 8)}`);

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.base-input {
  margin-bottom: 1rem;
}
.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}
.input:focus {
  outline: none;
  border-color: #409eff;
}
.has-error .input {
  border-color: #f56c6c;
}
.error-message {
  color: #f56c6c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.input, .textarea {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: white;
  padding: 12px 16px;
}
.input:focus, .textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(232,197,176,0.2);
}
</style>