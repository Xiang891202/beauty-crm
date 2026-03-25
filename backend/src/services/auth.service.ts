import * as authRepo from '../repositories/auth.repo';
import { signToken } from '../utils/jwt';

export const login = async (email: string, password: string) => {
  // 1. 找用戶
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  // 2. 驗證密碼（暫不實現）
  // const isValid = await bcrypt.compare(password, user.password);
  // if (!isValid) throw new Error('Invalid credentials');

  // 3. 產生 token
  const token = signToken({ id: user.id, role: user.role });
  return { token, user };
};

export const register = async (data: any) => {
  // 1. 檢查信箱是否存在
  const existing = await authRepo.findUserByEmail(data.email);
  if (existing) throw new Error('Email already exists');

  // 2. 哈希密碼（暫不實現）
  // const hashed = await bcrypt.hash(data.password, 10);
  // data.password = hashed;

  // 3. 新增用戶
  const newUser = await authRepo.createUser(data);
  const token = signToken({ id: newUser.id, role: newUser.role });
  return { token, user: newUser };
};