// frontend/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import PublicLayout from '@/layouts/PublicLayout.vue';

// 後台相關頁面
const Login = () => import('@/views/admin/auth/Login.vue');
const Dashboard = () => import('@/views/admin/dashboard/Dashboard.vue');
const MemberList = () => import('@/views/admin/members/MemberList.vue');
const MemberDetail = () => import('@/views/admin/members/MemberDetail.vue');
const UseService = () => import('@/views/admin/usage/UseService.vue');

// 前台頁面
const Home = () => import('@/views/public/Home.vue');
// const Services = () => import('@/views/public/Services.vue');
// const Products = () => import('@/views/public/Products.vue');
// const Contact = () => import('@/views/public/Contact.vue');
const CustomerLogin = () => import('@/views/public/CustomerLogin.vue');
const MyServices = () => import('@/views/public/MyServices.vue');
const MyServiceLogs = () => import('@/views/public/MyServiceLogs.vue');

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      // { path: 'services', name: 'Services', component: Services },
      // { path: 'products', name: 'Products', component: Products },
      // { path: 'contact', name: 'Contact', component: Contact },
      { path: 'customer/login', name: 'CustomerLogin', component: CustomerLogin },
      { 
        path: 'my-services', 
        name: 'MyServices', 
        component: MyServices,
        meta: { requiresAuth: true, role: 'customer' }
      },
      { 
        path: 'my-logs', 
        name: 'MyServiceLogs', 
        component: MyServiceLogs,
        meta: { requiresAuth: true, role: 'customer' }
      },
      { path: 'services', redirect: '/#services' },
      { path: 'products', redirect: '/#products' },
      { path: 'contact', redirect: '/#contact' },
    ],
  },
  {
    path: '/admin/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'members', name: 'MemberList', component: MemberList },
      { path: 'members/:id', name: 'MemberDetail', component: MemberDetail },
      { path: 'usage', name: 'UseService', component: UseService },
      { path: 'usage-list', name: 'UsageList', component: () => import('../views/admin/usage/UsageList.vue') },
      { path: 'products', name: 'ProductList', component: () => import('@/views/admin/products/ProductList.vue') },
      { path: 'services', name: 'ServiceList', component: () => import('@/views/admin/services/ServiceList.vue') },
      { path: 'adjustments', name: 'AdjustmentList', component: () => import('@/views/admin/adjustments/AdjustmentList.vue') },
      // { path: 'purchase-package', name: 'PurchasePackage', component: () => import('@/views/admin/members/PurchasePackage.vue') },
      { path: 'service-packages', component: () => import('@/views/admin/services/ServicePackageList.vue') },
      { path: 'service-packages/form/:id', component: () => import('@/views/admin/services/ServicePackageForm.vue') },
      { path: 'member-packages/purchase', name: 'MemberPackagePurchase', component: () => import('@/views/admin/member-packages/PurchasePackage.vue') },
      { path: 'gifts', component: () => import('@/views/admin/gifts/GiftList.vue') },
      // frontend/src/router/index.ts 的 admin children 中加入
      {
        path: 'signature',
        name: 'FullSignature',
        component: () => import('@/views/admin/signature/FullSignature.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      }
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  const user = raw && raw !== 'undefined' ? JSON.parse(raw) : null;

  // 需要登入但沒有 token
  if (to.meta.requiresAuth && !token) {
    if (to.meta.role === 'customer') return '/customer/login';
    return '/admin/login';
  }

  // 已登入但角色不符
  if (to.meta.role && user?.role !== to.meta.role) {
    return '/';
  }

  // 已登入的管理員試圖訪問登入頁
  if (to.path === '/admin/login' && token && user?.role === 'admin') {
    return '/admin/dashboard';
  }

  // 已登入的客戶試圖訪問客戶登入頁
  if (to.path === '/customer/login' && token && user?.role === 'customer') {
    return '/my-services';
  }

  return true;
});

export default router;