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
      role: data.user.role || 'customer'
    }
    user.value = userWithRole;
    token.value = data.token;
    
    // 寫入儲存空間
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userWithRole));
    
    window.dispatchEvent(new Event('auth-login'));
  }


  async function login(credentials: { email: string; password: string }) {
    try {
      // 這裡的 res 結構為：{ success: true, data: { token: '...', user: {...} } }
      const res = await loginApi(credentials.email, credentials.password);
      
      // 🎯 依據你提供的 JSON 結構進行精確解構
      if (res && res.success && res.data) {
        // 傳入內層包含 user 與 token 的物件給 setAuth
        setAuth({
          token: res.data.token,
          user: res.data.user
        });
      } else {
        throw new Error('登入回應格式不正確');
      }
      
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

  // frontend/src/stores/auth.store.ts
// ... 其他導入保持不變

  async function logout() {
    // 直接清除本地狀態，不呼叫後端 API
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 跳轉由呼叫方處理，此處不自動跳轉
    // window.dispatchEvent(new Event('auth-logout'));
  }

  async function restoreSession(): Promise<void> {
    const storedToken = localStorage.getItem('token');
    // 排除 token 被存成 "undefined" 字串的狀況
    if (storedToken && storedToken !== 'undefined') { 
      token.value = storedToken;
      try {
        const res = await getProfile();
        
        //  正確解析：取得真正的用戶 profile 資料
        const userData = res.data.data || res.data;
        
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
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