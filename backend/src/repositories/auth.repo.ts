
import pool  from "@/config/db";

export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  // 其他欄位
}


// 骨架：實際資料庫操作後續補齊
export const findUserByEmail = async (email: string): Promise<User | null> => {
  // 返回 null 或 throw new Error('Not implemented')
  // throw new Error('Not implemented');
  return null;
};

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  // throw new Error('Not implemented');
  return {
    id: 1,
    email: data.email,
    password: data.password,
    role: data.role,
  };
};