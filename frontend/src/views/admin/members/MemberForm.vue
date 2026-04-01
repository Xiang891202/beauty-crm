<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput v-model="form.name" label="姓名" required />
    <BaseInput v-model="form.phone" label="電話" />
    <!-- <BaseInput v-model="form.email" label="電子郵件" type="email" /> -->
    <BaseInput v-model="form.birthday" label="生日" type="date" />
    <!-- <BaseInput v-model="form.address" label="地址" /> -->
    <BaseInput v-model="form.password" label="密碼" type="password" :required="!isEdit" />
    <small v-if="isEdit" class="password-hint">若不修改密碼請留空</small>
    <BaseTextarea v-model="form.notes" label="備註" />

    <div class="form-actions">
      <BaseButton type="submit">儲存</BaseButton>
      <BaseButton type="button" @click="$emit('cancel')">取消</BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const form = reactive({
  name: '',
  phone: '',
  email: '',
  birthday: '',
  address: '',
  notes: '',
  password: '', // 可選，僅在創建時使用
});

const props = defineProps<{
  initialData?: {           // 编辑时传入现有数据
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    birthday?: string;
    address?: string;
    notes?: string;
    password?: string;
  };
}>();

// 如果是编辑模式，填充初始数据
watch(() => props.initialData, (data) => {
  if (data) {
    form.name = data.name || '';
    form.phone = data.phone || '';
    form.email = data.email || '';
    form.birthday = data.birthday || '';
    form.address = data.address || '';
    form.notes = data.notes || '';
    form.password = '';     // 密码字段留空，不显示原密码
  }
}, { immediate: true });

const isEdit = !!props.initialData;

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const handleSubmit = () => {
  const { password, ...rest } = form;
  // 编辑模式下，若密码为空，则删除密码字段（后端不更新密码）
  const submitData = isEdit && !password ? rest : { ...rest, password };
  emit('submit', submitData);
};
</script>

<style scoped>
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
</style>