// frontend/src/api/modules/member_service.ts
import http from '../http';
import type { ApiResponse } from '@/types';
import type { MemberService } from './service'; // 從 service.ts 導入 MemberService 類型

export const createMemberService = (data: {
  customer_id: number;
  service_id: number;
  total_sessions: number;
  expiry_date?: string;
}): Promise<ApiResponse<MemberService>> => {
  return http.post('/member-services', data);
};

// 若需要其他函數（如更新、刪除）可在此添加