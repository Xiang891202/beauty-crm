import http from '../http';
import type { ApiResponse } from '@/types';

// 組合包內的品項（來自模板）
export interface PackageItem {
  service_id: number;
  quantity: number;
  service?: {
    id: number;
    name: string;
  };
}

// 會員購買的組合包實例
export interface MemberPackage {
  id: string;
  customer_id: number;
  package_id: string;
  snapshot_name: string;
  snapshot_description: string;
  purchase_date: string;
  expiry_date: string | null;
  total_uses: number;
  remaining_uses: number;
  status: 'active' | 'expired' | 'used_up';
  package: {                     // 關聯的組合包模板（含品項清單）
    id: string;
    name: string;
    description: string;
    items: PackageItem[];
  };
}

// 為客戶購買組合包
export const purchasePackage = (data: {
  customer_id: number;
  package_id: string;
  purchase_date?: string;
  expiry_date?: string | null;
  total_uses?: number;
}): Promise<ApiResponse<MemberPackage>> =>
  http.post('/admin/member-packages/purchase', data);

// 查詢客戶的所有組合包（管理員）
export const getCustomerPackages = (customer_id: number): Promise<ApiResponse<MemberPackage[]>> =>
  http.get('/admin/member-packages/packages', { params: { customer_id } });

// 查詢單一會員組合包詳細
export const getMemberPackageDetail = (id: string): Promise<ApiResponse<MemberPackage>> =>
  http.get(`/admin/member-packages/packages/${id}`);

// 扣次使用
export const useService = (data: {
  member_package_id: string;
  selected_service_ids: number[];
  notes?: string;
  signature_url?: string;
  staff_id?: number;
  gifts?: Array<{ description: string; notes?: string }>;
}) => http.post('/admin/member-packages/use', data);

// 人工調整（僅調整總次數）
export const adjustRemaining = (data: {
  member_package_id: string;
  delta: number;
  reason?: string;
  notes?: string;
}) => http.post('/admin/member-packages/adjust', data);

// 查詢使用紀錄
export const getUsageLogs = (params: { customer_id?: number; member_package_id?: string }): Promise<ApiResponse<any[]>> =>
  http.get('/admin/member-packages/usage-logs', { params });