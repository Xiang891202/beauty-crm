
export interface User {
  id: number;
  email: string;
  password_hash: string;
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