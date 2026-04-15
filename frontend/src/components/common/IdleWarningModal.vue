<template>
  <BaseModal v-model="visible" title="閒置提示" :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="text-center">
      <p>您已閒置超過 10 分鐘，是否繼續使用？</p>
      <p class="text-red-500 mt-2">將在 {{ countdown }} 秒後自動登出</p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton @click="handleLogout">登出 ({{ countdown }})</BaseButton>
        <BaseButton type="primary" @click="handleContinue">是</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  modelValue: boolean;
  countdown: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'continue'): void;
  (e: 'logout'): void;
}>();

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleContinue = () => {
  emit('continue');
  visible.value = false;
};

const handleLogout = () => {
  emit('logout');
  visible.value = false;
};
</script>