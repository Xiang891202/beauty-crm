import http from '../http';

export const createUsage = (formData: FormData) => {
  return http.post('/service-logs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 新增獲取使用記錄列表
export const getUsageList = (params: any) => {
  return http.get('/service-logs', { params });
};

// api/modules/usage.ts
export const getMyServiceLogs = () => {
  return http.get('/customers/me/service-logs');
};