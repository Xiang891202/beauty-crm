// src/types/index.ts

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: string; // 例如 'admin', 'staff'
  // 其他字段根据后端返回补充
}

// frontend/src/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}