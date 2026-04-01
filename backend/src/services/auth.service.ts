import * as authRepo from '../repositories/auth.repo';
import { generateToken } from '../utils/jwt';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

/////////////////管理員/////////////////

export const login = async (email: string, password: string) => {
  // 1. 找用戶
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  // 2. 驗證密碼（暫不實現）
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error('Invalid credentials');

  // 3. 產生 token
  const token = generateToken({ id: user.id, role: user.role });
  return { token, user };
};

export const register = async (data: any) => {
  // 1. 檢查信箱是否存在
  const existing = await authRepo.findUserByEmail(data.email);
  if (existing) throw new Error('Email already exists');

  // 2. 哈希密碼（暫不實現）
  const hashed = await bcrypt.hash(data.password, 10);

  // 3. 新增用戶
  const newUser = await authRepo.createUser({
    email: data.email,
    password_hash: hashed,
    role: data.role || 'user',   // 注册时默认角色，你可以改为 admin 或根据需求
  });
  const token = generateToken({ id: newUser.id, role: newUser.role });
  return { token, user: newUser };
};

/////////////////客戶/////////////////
export class AuthService {
  async validateCustomer(phone: string, password: string) {
    //使用 prisma 查詢客戶表
    const customer = await prisma.customer.findFirst({ 
      where: { phone } 
    });

    if (!customer || !customer.password_hash) {
      return null; // 客戶不存在或沒有密碼
    }

    //驗證密碼
    const isValid = await bcrypt.compare(password, customer.password_hash);
    if (!isValid) {
      return null; // 密碼錯誤
    }

    const { password_hash, ...customerData } = customer; // 排除密碼哈希
    return customerData; // 返回客戶資料（不包含密碼哈希）
}};