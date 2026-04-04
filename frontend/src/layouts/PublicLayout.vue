<template>
  <div class="public-layout" :class="{ 'menu-open': menuOpen }">
    <header>
      <div class="header-container">
        <div class="logo" @click="router.push('/')">🌸 EMERALD 艾鎷珞</div>
        <button class="menu-toggle" @click="toggleMenu" :class="{ active: menuOpen }">
          <span></span><span></span><span></span>
        </button>
        <nav :class="{ open: menuOpen }">
          <a href="#" @click.prevent="navigateAndScroll('hero')">首頁</a>
          <a href="#" @click.prevent="navigateAndScroll('services')">服務項目</a>
          <a href="#" @click.prevent="navigateAndScroll('products')">商品</a>
          <a href="#" @click.prevent="navigateAndScroll('contact')">聯絡我們</a>

          <template v-if="authStore.isLoggedIn && authStore.user?.role === 'customer'">
            <router-link to="/my-services" @click="closeMenu">我的療程包</router-link>
            <router-link to="/my-logs" @click="closeMenu">使用記錄</router-link>
            <button class="logout-btn" @click="handleLogout">登出</button>
          </template>
          <template v-else>
            <router-link to="/customer/login" @click="closeMenu">會員登入</router-link>
          </template>
        </nav>
      </div>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; 2025 美容工作室 | 版權所有</p>
    </footer>
    <!-- 遮罩层 -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMenu = () => {
  menuOpen.value = false;
  document.body.style.overflow = '';
};

const navigateAndScroll = (sectionId: string) => {
  closeMenu();
  if (route.path !== '/') {
    router.push({ path: '/', hash: `#${sectionId}` });
  } else {
    scrollToElement(sectionId);
    router.push({ hash: `#${sectionId}` });
  }
};

const scrollToElement = (sectionId: string) => {
  setTimeout(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  closeMenu();
};

// 路由变化时关闭菜单
watch(() => route.path, () => {
  closeMenu();
});

// 窗口大小变化，若大于768px则关闭菜单
const handleResize = () => {
  if (window.innerWidth > 768 && menuOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>