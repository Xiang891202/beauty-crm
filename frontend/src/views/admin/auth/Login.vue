<template>
  <BackendHealthCheck>
    <div class="login-container">
      <form @submit.prevent="handleLogin">
        <h2>管理員登入</h2>
        <div>
          <label>郵箱</label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>密碼</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit" :disabled="loading">登入</button>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </BackendHealthCheck>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import BackendHealthCheck from '@/components/common/BackendHealthCheck.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    if (authStore.user?.role !== 'admin') {
      error.value = '只有管理員帳號可以登入後台'
      await authStore.logout()
      return
    }
    router.push('/admin/dashboard')
  } catch (err: any) {
    error.value = err.message || '登入失敗，請檢查帳號密碼'
  } finally {
    loading.value = false
  }
}
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