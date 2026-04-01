<template>
  <div class="base-textarea">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="onInput"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      class="textarea"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const id = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`);

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.base-textarea {
  margin-bottom: 1rem;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
.textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}
.textarea:focus {
  outline: none;
  border-color: #007bff;
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