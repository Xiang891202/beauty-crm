import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import router from '@/router'
import { v4 as uuidv4 } from 'uuid';

// 自定義實例類型，將響應數據直接作為返回值（而不是 AxiosResponse）
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// 後端基礎位址（從環境變數讀取，預設為個人開發環境）
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const instance: AxiosInstance = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,   // 完整後端 API 位址
  timeout: 10000,
});

// 請求攔截器
// src/api/http.ts 請求攔截器部分修正
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // 🎯 核心防禦：必須確保 token 存在、不是空值，且絕對不能是 "undefined" 或 "null" 字串
  if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 如果 token 是壞的，直接把這個 header 刪除，不讓錯誤的 Bearer undefined 送到後端
    delete config.headers.Authorization;
  }
  
  // 對 POST / PATCH 請求加入 idempotency key
  if (config.method === 'post' || config.method === 'patch') {
    config.headers['X-Idempotency-Key'] = uuidv4();
  }
  return config;
});


// 響應攔截器：直接返回 res.data（解包）
instance.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      const config = error.config;
      // 登入請求的 401 不自動跳轉
      const isLoginRequest = config.url && (
        config.url.includes('/login') || 
        config.url.includes('/auth/login') ||
        config.url.includes('/customer/login')
      );
      if (isLoginRequest) {
        return Promise.reject(error.response?.data || error.message);
      }
      
      // 非登入請求：清除憑證
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 根據當前頁面路徑決定跳轉到哪個登入頁
      if (window.location.pathname.startsWith('/admin')) {
        router.push('/admin/login');
      } else {
        router.push('/customer/login');
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 導出自定義類型的實例
const http = instance as CustomAxiosInstance;
export default http;