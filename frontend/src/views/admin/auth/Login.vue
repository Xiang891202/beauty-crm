<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>管理员登入</h2>
      <div>
        <label>郵箱</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>密碼</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">登录</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api/modules/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await login(email.value, password.value);
    const { token, user } = res.data.data;
    // 验证是否为管理员
    if (user.role !== 'admin') {
      error.value = '只有管理员账号可以登录后台';
      return;
    }
    localStorage.setItem('token', token);
    router.push('/admin/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.error || '登录失败，请检查账号密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.login-container div {
  margin-bottom: 16px;
}
.login-container input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
}
.login-container button {
  width: 100%;
  padding: 8px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
.error {
  margin-top: 12px;
  color: red;
}
</style>