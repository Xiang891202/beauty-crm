// frontend/src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProfile, login as loginApi, logout as logoutApi, customerLogin as customerLoginApi } from '@/api/modules/auth';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(data: { user: User; token: string }) {
    const userWithRole = {
      ...data.user,
      role: data.user.role || 'customer', // 确保用户对象有 role 属性，默认为 'customer'
    }
    user.value = userWithRole;
    token.value = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userWithRole));
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const res = await loginApi(credentials.email, credentials.password);
      setAuth(res.data);
      return res;
    } catch (error) {
      console.error('登入失敗', error);
      throw error;
    }
  }

  async function customerLogin(phone: string, password: string) {
    try {
      const res = await customerLoginApi(phone, password);
      const userData = res.data.user;
      if (!userData.role) userData.role = 'customer'; // 确保客户用户对象有 role 属性，默认为 'customer'
      setAuth({ user: userData, token: res.data.token });
      return res;
    } catch (error) {
      console.error('客戶登入失敗', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await logoutApi();
    } catch (error) {
      console.error('登出 API 失敗', error);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async function restoreSession(): Promise<void> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      try {
        const res = await getProfile();
        user.value = res.data;
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (error) {
        console.error('還原 session 失敗', error);
        token.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    customerLogin,
    logout,
    restoreSession,
  };
});