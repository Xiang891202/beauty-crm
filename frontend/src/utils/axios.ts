import axios from 'axios';

// 直接從環境變數讀取 baseURL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 10000,
});
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

export default apiClient;