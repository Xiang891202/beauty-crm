import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProfile, login as loginApi, logout as logoutApi } from '@/api/modules/auth';
import type { User } from '@/types';
// import { t } from 'vue-router/dist/index-BzEKChPW.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(data: { user: User; token: string }) {
    user.value = data.user;
    token.value = data.token;
    localStorage.setItem('token', data.token);
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const res = await loginApi(credentials.email, credentials.password);
      setAuth(res.data); // 假设后端返回 { user, token }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
    }
  }

  function restoreSession(): Promise<void> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      return getProfile().then(res => {
        user.value = res.data; // 假设后端返回用户信息
      }).catch(() => {
        // 如果获取用户信息失败，可能是 token 无效，清除 session
        token.value = null;
        localStorage.removeItem('token');
        logout();
      });
      // 可选：调用获取用户信息的接口，设置 user.value
    }
    return Promise.resolve();
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    restoreSession,
  };
});