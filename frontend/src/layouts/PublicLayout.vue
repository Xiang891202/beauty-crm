<template>
  <div>
    <header>
      <nav>
        <router-link to="/">首頁</router-link>
        <router-link to="/services">服務項目</router-link>
        <router-link to="/products">商品</router-link>
        <router-link to="/contact">聯絡我們</router-link>

        <!-- 根據登入狀態顯示不同內容 -->
        <template v-if="authStore.isLoggedIn && authStore.user?.role === 'customer'">
          <router-link to="/my-services">我的療程包</router-link>
          <router-link to="/my-logs">使用記錄</router-link>
          <button @click="handleLogout">登出</button>
        </template>
        <template v-else>
          <router-link to="/customer/login">會員登入</router-link>
        </template>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.token && !authStore.isLoggedIn) {
    authStore.restoreSession();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.public-layout { font-family: 'Quicksand', 'Segoe UI', sans-serif; color: #4a3b2f; background: #fffcf9; }
.public-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 5%; background: rgba(255,255,240,0.96); backdrop-filter: blur(8px); border-bottom: 1px solid #f3e7de; }
.logo { font-size: 1.8rem; font-weight: 400; letter-spacing: 2px; color: #b28b6f; }
nav a, .login-btn, .logout-btn { margin-left: 2rem; text-decoration: none; color: #5e3e2e; font-weight: 500; transition: color 0.2s; }
nav a:hover, .login-btn:hover { color: #d48c5b; }
.login-btn, .logout-btn { background: #f2e5db; padding: 0.4rem 1.2rem; border-radius: 40px; border: none; cursor: pointer; }
.footer { text-align: center; padding: 2rem; background: #faf3ed; color: #aa8b74; font-size: 0.9rem; }
.public-layout { font-family: 'Quicksand', 'Segoe UI', sans-serif; color: #4a3b2f; background: #fffcf9; }
.public-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 5%; background: rgba(255,255,240,0.96); backdrop-filter: blur(8px); border-bottom: 1px solid #f3e7de; }
.logo { font-size: 1.8rem; font-weight: 400; letter-spacing: 2px; color: #b28b6f; }
nav a, .login-btn, .logout-btn { margin-left: 2rem; text-decoration: none; color: #5e3e2e; font-weight: 500; transition: color 0.2s; }
nav a:hover, .login-btn:hover { color: #d48c5b; }
.login-btn, .logout-btn { background: #f2e5db; padding: 0.4rem 1.2rem; border-radius: 40px; border: none; cursor: pointer; }
.logout-btn { background: #f0e0d4; }
.footer { text-align: center; padding: 2rem; background: #faf3ed; color: #aa8b74; font-size: 0.9rem; }
</style>