import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import PublicLayout from '@/layouts/PublicLayout.vue';

// 後台相關頁面（延遲加載）
const Login = () => import('@/views/admin/auth/Login.vue');
const Dashboard = () => import('@/views/admin/dashboard/Dashboard.vue');
const MemberList = () => import('@/views/admin/members/MemberList.vue');
const MemberDetail = () => import('@/views/admin/members/MemberDetail.vue');
const UseService = () => import('@/views/admin/usage/UseService.vue');

// 前台頁面
const Home = () => import('@/views/public/Home.vue');
const Services = () => import('@/views/public/Services.vue');
const Products = () => import('@/views/public/Products.vue');
const Contact = () => import('@/views/public/Contact.vue');

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'services', name: 'Services', component: Services },
      { path: 'products', name: 'Products', component: Products },
      { path: 'contact', name: 'Contact', component: Contact },
    ],
  },
  // 登录页单独路由，不使用 AdminLayout
  {
    path: '/admin/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      // { path: 'login', name: 'Login', component: Login, meta: { requiresAuth: false } },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'members', name: 'MemberList', component: MemberList },
      { path: 'members/:id', name: 'MemberDetail', component: MemberDetail },
      { path: 'usage', name: 'UseService', component: UseService },
      { path: 'usage-list', name: 'UsageList', component: () => import('../views/admin/usage/UsageList.vue'), },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('@/views/admin/products/ProductList.vue'),
      },
      {
        path: 'services',
        name: 'ServiceList',
        component: () => import('@/views/admin/services/ServiceList.vue'),
      },
      {
        path: 'adjustments',
        name: 'AdjustmentList',
        component: () => import('@/views/admin/adjustments/AdjustmentList.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/admin/login');
  } else if (to.path === '/admin/login' && token) {
    next('/admin/dashboard');
  } else {
    next();
  }
});

export default router;