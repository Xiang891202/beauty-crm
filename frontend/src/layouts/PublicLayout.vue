<template>
  <div class="public-layout">
    <header class="public-header">
      <div class="logo">🌸 沐光美學</div>
      <nav>
        <router-link to="/">首頁</router-link>
        <router-link to="/services">服務項目</router-link>
        <router-link to="/products">產品</router-link>
        <router-link to="/contact">聯絡我們</router-link>

        <!-- 客戶登入後顯示會員專區 -->
        <template v-if="isLoggedIn && user?.role === 'customer'">
          <router-link to="/my-services">我的服務包</router-link>
          <router-link to="/my-logs">使用紀錄</router-link>
          <button @click="logout" class="logout-btn">登出</button>
        </template>

        <router-link v-else to="/customer/login" class="login-btn">會員登入</router-link>
        <!-- <button v-else @click="logout" class="logout-btn">登出</button> -->
      </nav>
    </header>
    <main><router-view /></main>
    <footer class="footer">© 2026 沐光美學 | 綻放你的自信之美</footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRoute } from 'vue-router';

const auth = useAuthStore();
const route = useRoute();

const isLoggedIn = computed(() => !!auth.isLoggedIn);
const user = computed(() => auth.user);

const logout = async() => {
  await authStore.logout();
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