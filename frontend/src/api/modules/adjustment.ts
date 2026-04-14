import http from '../http';
import type { ApiResponse } from '@/types';

export interface Adjustment {
  id: number;
  member_service_id: number | null;
  member_package_id: string | null;
  package_snapshot_name?: string | null;
  adjustment_type: 'INCREASE' | 'DECREASE';
  amount: number;
  reason: string | null;
  created_by: number;
  created_at: string;
  customer?: { name: string };
  customer_id?: number;
}

export const getAdjustments = (params?: any): Promise<ApiResponse<{ items: Adjustment[]; total: number }>> => {
  return http.get('/adjustments', { params });
};

export const createAdjustment = (data: any): Promise<ApiResponse<Adjustment>> => {
  return http.post('/adjustments', data);
};