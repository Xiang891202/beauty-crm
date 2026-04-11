<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput v-model="form.name" label="姓名" required :error="errors.name" @blur="validateName" />
    <BaseInput v-model="form.phone" label="電話" required :error="errors.phone" @blur="validatePhone" />
    <!-- <BaseInput v-model="form.email" label="電子郵件" type="email" /> -->
    <BaseInput v-model="form.birthday" label="生日" type="date" />
    <!-- <BaseInput v-model="form.address" label="地址" /> -->
    <BaseInput
      v-model="form.password"
      label="密碼"
      type="password"
      :required="!isEdit"
      :error="errors.password"
      @blur="validatePassword"
    />
    <small v-if="isEdit" class="password-hint">若不修改密碼請留空</small>

    <div class="form-actions">
      <BaseButton type="submit">儲存</BaseButton>
      <BaseButton type="button" @click="$emit('cancel')">取消</BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const form = reactive({
  name: '',
  phone: '',
  email: '',
  birthday: '',
  address: '',
  password: '',
});

const errors = reactive({
  name: '',
  phone: '',
  password: '',
});

const props = defineProps<{
  initialData?: {
    id?: number;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    birthday?: string | null;
    address?: string | null;
  };
}>();

const isEdit = !!props.initialData?.id;

const validateName = () => {
  if (!form.name.trim()) errors.name = '姓名不能為空';
  else errors.name = '';
};

const validatePhone = () => {
  const phoneRegex = /^09\d{8}$/;
  if (!form.phone) errors.phone = '電話為必填欄位';
  else if (!phoneRegex.test(form.phone)) errors.phone = '請輸入有效的台灣手機號碼 (09xxxxxxxx)';
  else errors.phone = '';
};

const validatePassword = () => {
  if (!isEdit && !form.password) errors.password = '密碼為必填欄位';
  else if (form.password && form.password.length < 8) errors.password = '密碼至少需要 8 個字元';
  else errors.password = '';
};

// 監聽 initialData 變化，填充表單
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.name = data.name ?? '';
      form.phone = data.phone ?? '';
      form.email = data.email ?? '';
      form.birthday = data.birthday ?? '';
      form.address = data.address ?? '';
      form.password = '';
      errors.name = '';
      errors.phone = '';
      errors.password = '';
    }
  },
  { immediate: true }
);

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const handleSubmit = () => {
  validateName();
  validatePhone();
  validatePassword();
  if (errors.name || errors.phone || errors.password) return;

  const { password, ...rest } = form;
  const submitData = isEdit && !password ? rest : { ...rest, password };
  emit('submit', submitData);
};
</script>

<!-- <style scoped>
.password-hint {
  display: block;
  margin-top: -12px;
  margin-bottom: 12px;
  color: #666;
  font-size: 12px;
}
.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style> -->