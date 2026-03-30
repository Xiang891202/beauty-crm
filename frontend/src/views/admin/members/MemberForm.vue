<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput v-model="form.name" label="姓名" required />
    <BaseInput v-model="form.phone" label="電話" />
    <BaseInput v-model="form.email" label="電子郵件" type="email" />
    <BaseInput v-model="form.birthday" label="生日" type="date" />
    <BaseInput v-model="form.address" label="地址" />
    <BaseTextarea v-model="form.notes" label="備註" />

    <div class="form-actions">
      <BaseButton type="submit">儲存</BaseButton>
      <BaseButton type="button" @click="$emit('cancel')">取消</BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const form = reactive({
  name: '',
  phone: '',
  email: '',
  birthday: '',
  address: '',
  notes: ''
});

const emit = defineEmits<{
  (e: 'submit', data: typeof form): void;
  (e: 'cancel'): void;
}>();

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>