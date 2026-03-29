
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
  remaining_sessions: number;
  purchased_at?: Date;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// 使用记录（服务日志）
export interface ServiceLog {
  id: number;
  customer_id: number | null;           // 可选，某些记录可能没有关联客户
  service_id?: number | null;      // 可選
  member_service_id: number | null;  // 可选，关联到会员服务（如果有的话）
  used_at: Date | null;              // 使用时间，允许为 null
  notes?: string | null;            // ✅ 改為 note
  signature_url?: string | null;
  created_at: Date | null;           // 创建时间，允许为 null
  created_by: number | null;              // 必要（但資料庫允許 NULL，視需求調整）
}

// 修正记录
export interface Adjustment {
  id: number;
  // customer_id?: number | null;
  member_service_id: number | null;  // 关联到会员服务，允许为 null（如果调整不针对特定服务）
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