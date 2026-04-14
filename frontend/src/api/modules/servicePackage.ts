import http from '../http';
import type { ApiResponse } from '@/types';

export interface ServicePackageItem {
  service_id: number;
  quantity: number;
    service?: {
    id: number;
    name: string;
  };
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number | null;
  is_active: boolean;
  deleted_at?: string | null;
  items: ServicePackageItem[];
  created_at: string;
  updated_at: string;
}

export const getPackages = (params?: { is_active?: boolean; include_deleted?: boolean }) =>
  http.get<{ success: boolean; data: ServicePackage[] }>('/service-packages/packages', { params });

export const getPackage = (id: string): Promise<ApiResponse<ServicePackage>> =>
  http.get(`/service-packages/packages/${id}`);

export const createPackage = (data: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ServicePackage>> =>
  http.post('/service-packages/packages', data);

export const updatePackage = (id: string, data: Partial<Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<ServicePackage>> =>
  http.put(`/service-packages/packages/${id}`, data);

// ... 其他导入与接口 ...

export const restorePackage = (id: string): Promise<ApiResponse<void>> =>
  http.post(`/service-packages/packages/${id}/restore`);

export const deletePackage = (id: string): Promise<ApiResponse<void>> =>
  http.delete(`/service-packages/packages/${id}`);