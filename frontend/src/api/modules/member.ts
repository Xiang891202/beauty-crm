import http from '../http';
import type { ApiResponse } from '@/types';
import type { MemberService } from './service';  // ✅ 使用 import type

export interface Member {
  id: number;
  name: string;
  phone?: string | null;
  email?: string;
  birth_date?: string | null;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getMemberServices = (memberId: number): Promise<ApiResponse<MemberService[]>> => {
  return http.get(`/members/${memberId}/services`);
};

export const getMembers = (): Promise<ApiResponse<Member[]>> => {
  return http.get('/members');
};

export const getMember = async (id: number): Promise<ApiResponse<Member>> => {
  const response = await http.get(`/members/${id}`);
  return response;
};

export const createMember = async (data: Partial<Member>): Promise<ApiResponse<Member>> => {
  const response = await http.post('/members', data);
  return response;
};

export const updateMember = async (id: number, data: Partial<Member>): Promise<ApiResponse<Member>> => {
  const response = await http.put(`/members/${id}`, data);
  return response;
};

export const deleteMember = async (id: number): Promise<ApiResponse<void>> => {
  const response = await http.delete(`/members/${id}`);
  return response;
};