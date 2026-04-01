import http from '../http';
import type { ApiResponse } from '@/types';

// 使用紀錄數據結構（根據後端實際欄位擴充）
export interface ServiceLog {
  id: number;
  customer_id: number;
  member_service_id: number;
  service_id: number;
  used_at: string;
  notes: string | null;
  signature_url: string | null;
  created_by: number | null;
  created_at: string;
  // 如果需要顯示服務名稱，可能需要關聯查詢，可包含 service 對象
  service?: {
    id: number;
    name: string;
  };
}

export const getMyServiceLogs = async (): Promise<ApiResponse<ServiceLog[]>> => {
  const response = await http.get('/service-logs/customers/me/service-logs');
  return response;
};

// 其他函數...

export const createUsage = (formData: FormData) => {
  return http.post('/service-logs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 新增獲取使用記錄列表
export const getUsageList = (params: any) => {
  return http.get('/service-logs', { params });
};
