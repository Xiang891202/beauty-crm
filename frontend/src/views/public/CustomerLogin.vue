<template>
  <div class="customer-login">
    <div class="card">
      <h2>🌸 會員登入</h2>
      <form @submit.prevent="handleLogin">
        <BaseInput v-model="phone" label="手機號碼" placeholder="0912345678" />
        <BaseInput 
          v-model="password" 
          label="密碼" 
          type="password" 
          :error="passwordError"
          @blur="validatePassword"
        />
        <BaseButton :loading="loading" block>登入</BaseButton>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const auth = useAuthStore();
const router = useRouter();
const phone = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const passwordError = ref('');

const validatePassword = () => {
  if (password.value.length > 0 && password.value.length < 8) {
    passwordError.value = '密碼至少需要 8 個字元';
  } else {
    passwordError.value = '';
  }
};

const handleLogin = async () => {
  validatePassword();
  if (passwordError.value) return;
  
  loading.value = true;
  error.value = '';
  try {
    await auth.customerLogin(phone.value, password.value);
    router.push('/my-services');
  } catch (err: any) {
    error.value = err.message || '登入失敗，請檢查手機號碼或密碼';
  } finally {
    loading.value = false;
  }
};
</script>

<!-- <style scoped>
/* 保持原有樣式 */
.customer-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.card {
  background: white;
  border-radius: 32px;
  padding: 2rem;
  width: 360px;
  box-shadow: var(--shadow);
}
h2 {
  color: var(--accent);
  text-align: center;
  margin-bottom: 1.5rem;
}
.error {
  color: #d9534f;
  margin-top: 1rem;
  text-align: center;
}
</style> -->