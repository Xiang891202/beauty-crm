
//用戶
export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

//服務接口
export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;   // 新增
  created_at?: Date;
  updated_at?: Date;
}

// 顾客 (会员)
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  birth_date?: Date;
  address?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 会员服务（购买的服务包）
export interface MemberService {
  id: number;
  customer_id: number;
  service_id: number;
  remaining: number;
  purchased_at?: Date;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// 使用记录（服务日志）
export interface ServiceLog {
  id: number;
  customer_id: number | null;
  member_service_id?: number | null;
  service_id: number | null;
  used_at: Date | null;
  notes?: string | null;
  signature_url?: string | null;
  created_by: number | null;
  created_at?: Date | null;
}

// 修正记录
export interface Adjustment {
  id: number;
  customer_id?: number | null;
  member_service_id?: number | null;
  adjustment_type: string | null;
  amount: number;
  reason?: string | null;
  created_by: number | null;
  created_at?: Date | null;
}

// 业务常量（可选）
export const AdjustmentType = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
} as const;
export type AdjustmentType = typeof AdjustmentType[keyof typeof AdjustmentType];