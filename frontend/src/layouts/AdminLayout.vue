<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/admin/dashboard">儀表板</router-link></li>
          <li><router-link to="/admin/members">會員管理</router-link></li>
          <li><router-link to="/admin/services">服務管理</router-link></li>
          <li><router-link to="/admin/products">商品管理</router-link></li>
          <li><router-link to="/admin/usage-list">會員使用紀錄</router-link></li>
          <li><router-link to="/admin/adjustments">人工補償</router-link></li>
        </ul>

        <!-- 登出按钮 -->
        <div class="logout">
          <button @click="handleLogout">登出</button>
        </div>

      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/admin/login');
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  margin-bottom: 10px;
}
.sidebar a {
  text-decoration: none;
  color: #333;
}
.sidebar a.router-link-active {
  font-weight: bold;
  color: #007bff;
}
.content {
  flex: 1;
  padding: 20px;
}
.logout {
  margin-top: 40px;
  text-align: center;
}
.logout button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.logout button:hover {
  background-color: #c82333;
}
</style>