<template>
  <div class="admin-layout" :class="{ 'menu-open': menuOpen }">
    <button class="menu-toggle" @click="toggleMenu">
      <span></span><span></span><span></span>
    </button>
    <aside class="sidebar" :class="{ open: menuOpen }">
      <nav>
        <ul>
          <li><router-link to="/admin/dashboard" @click="closeMenu">儀表板</router-link></li>
          <li><router-link to="/admin/members" @click="closeMenu">會員管理</router-link></li>
          <li><router-link to="/admin/services" @click="closeMenu">課程管理</router-link></li>
          <li><router-link to="/admin/service-packages" @click="closeMenu">組合包管理</router-link></li>
          <!-- <li><router-link to="/admin/products" @click="closeMenu">商品管理</router-link></li> -->
          <li><router-link to="/admin/usage-list" @click="closeMenu">會員使用紀錄</router-link></li>
          <li><router-link to="/admin/adjustments" @click="closeMenu">人工補償</router-link></li>
        </ul>
        <div class="logout">
          <button @click="handleLogout" class="btn">登出</button>
        </div>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useIdleTimeout } from '@/composables/useIdleTimeout';

const router = useRouter();
const route = useRoute();
const menuOpen = ref(false);
useIdleTimeout();

const toggleMenu = () => { menuOpen.value = !menuOpen.value; };
const closeMenu = () => { menuOpen.value = false; };

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/admin/login');
};

// 路由變更後自動關閉選單
watch(() => route.path, () => closeMenu());
</script>