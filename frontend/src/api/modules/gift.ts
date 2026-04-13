import http from '../http';
import type { ApiResponse } from '@/types';

export interface Gift {
  id: string;
  member_package_id: string;
  gift_description: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  notes: string | null;
  created_at: string;
  member_service_packages?: {
    customer_id: number;
    snapshot_name: string;
  };
}

export const getGifts = (params?: { member_package_id?: string; is_redeemed?: boolean }): Promise<ApiResponse<Gift[]>> =>
  http.get('/admin/member-packages/gifts/all', { params });

export const createGift = (data: { member_package_id: string; gift_description: string; notes?: string }): Promise<ApiResponse<Gift>> =>
  http.post('/admin/member-packages/gifts', data);

export const updateGift = (id: string, data: Partial<{ gift_description: string; is_redeemed: boolean; notes: string }>): Promise<ApiResponse<Gift>> =>
  http.put(`/admin/member-packages/gifts/${id}`, data);

export const deleteGift = (id: string): Promise<ApiResponse<void>> =>
  http.delete(`/admin/member-packages/gifts/${id}`);