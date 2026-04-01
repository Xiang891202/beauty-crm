import http from '../http';
import type { ApiResponse } from '@/types';

// 療程包數據結構
export interface MemberService {
  id: number;
  customer_id: number;
  service_id: number;
  total_sessions: number;
  remaining_sessions: number;
  purchased_at: string;
  expires_at: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  service: {
    id: number;
    name: string;
    description: string;
    price: string;
    created_at: string;
    updated_at: string;
    duration_minutes: number;
    is_active: boolean;
  };
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description: string | null;
}

export const getServices = (): Promise<ApiResponse<Service[]>> => {
  return http.get('/services');
};

export const getMyServices = async (): Promise<ApiResponse<MemberService[]>> => {
  const response = await http.get('/member-services/customers/me/member-services');
  return response; // 現在 response 的類型就是 ApiResponse<MemberService[]>
};