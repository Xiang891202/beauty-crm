<template>
  <div class="public-layout" :class="{ 'menu-open': menuOpen }" style="position: relative; min-height: 100vh;">
    <header>
      <div class="header-container">
        <div class="logo" @click="router.push('/')">🌸 EMERALD 艾鎷珞</div>
        <button class="menu-toggle" @click="toggleMenu" :class="{ active: menuOpen }">
          <span></span><span></span><span></span>
        </button>
        <nav class="desktop-nav">
          <a href="#" @click.prevent="navigateAndScroll('hero')">首頁</a>
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
    <!-- 手机版菜单（通过 Teleport 移到 body 下） -->
    <Teleport to="body">
      <div v-if="menuOpen" class="mobile-menu-overlay" @click="closeMenu"></div>
      <div class="mobile-nav" :class="{ open: menuOpen }">
        <a href="#" @click.prevent="navigateAndScroll('hero'); closeMenu()">首頁</a>
        <template v-if="authStore.isLoggedIn && authStore.user?.role === 'customer'">
          <router-link to="/my-services" @click="closeMenu">我的療程包</router-link>
          <router-link to="/my-logs" @click="closeMenu">使用記錄</router-link>
          <button class="logout-btn" @click="handleLogout">登出</button>
        </template>
        <template v-else>
          <router-link to="/customer/login" @click="closeMenu">會員登入</router-link>
        </template>
      </div>
    </Teleport>

    <!-- <footer>
      <p>&copy; 2025 美容工作室 | 版權所有</p>
    </footer> -->
    <!-- 遮罩层 -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useIdleTimeout } from '@/composables/useIdleTimeout';
// import { use } from 'echarts/types/src/extension.js';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
useIdleTimeout();
console.log('useIdleTimeout initialized');

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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/customer/login');
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

<style scoped>
/* 整体背景 Logo 图片 */
.public-layout {
  position: relative;
  min-height: 100vh;
  background-image: url('/images/logo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 半透明白色遮罩 */
.public-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
  z-index: 0;
}

/* 所有内容在遮罩上方 */
.public-layout > * {
  position: relative;
  z-index: 1;
}

/* 桌面版导航样式 */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* 手机版菜单样式（通过 Teleport 挂载到 body，样式不受父组件影响） */
.mobile-nav {
  position: fixed;
  top: 0;
  right: -100%;
  width: 70%;
  max-width: 280px;
  height: 100vh;
  background: white;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  z-index: 1002;
  display: flex;
}

.mobile-nav.open {
  right: 0;
}

.mobile-nav a,
.mobile-nav button {
  color: black;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  display: block;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  text-decoration: none;
}

.mobile-nav a:hover,
.mobile-nav button:hover {
  color: var(--accent);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  cursor: pointer;
}

/* 手机版隐藏桌面导航 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .menu-toggle {
    display: flex;
  }
}

/* 桌面版隐藏手机菜单相关元素 */
@media (min-width: 769px) {
  .mobile-nav,
  .mobile-menu-overlay,
  .menu-toggle {
    display: none !important;
  }
}
</style>