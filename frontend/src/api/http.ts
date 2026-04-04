import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

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
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 響應攔截器：直接返回 res.data（解包）
instance.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err) => Promise.reject(err.response?.data || err.message)
);

// 導出自定義類型的實例
const http = instance as CustomAxiosInstance;
export default http;