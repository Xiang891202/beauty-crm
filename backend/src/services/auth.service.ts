import * as authRepo from '../repositories/auth.repo';
import { signToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const login = async (email: string, password: string) => {
  // 1. 找用戶
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  // 2. 驗證密碼（暫不實現）
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error('Invalid credentials');

  // 3. 產生 token
  const token = signToken({ id: user.id, role: user.role });
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
  const token = signToken({ id: newUser.id, role: newUser.role });
  return { token, user: newUser };
};