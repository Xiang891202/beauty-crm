import { login, register, AuthService } from '@/services/auth.service';
import * as authRepo from '@/repositories/auth.repo';
import prisma from '@/config/prisma';
import bcrypt from 'bcrypt';

jest.mock('@/repositories/auth.repo');
jest.mock('@/config/prisma', () => ({
  __esModule: true,
  default: { customer: { findFirst: jest.fn() } },
}));
jest.mock('bcrypt');

describe('auth.service', () => {
  describe('login', () => {
    it('登入成功回傳 token', async () => {
      (authRepo.findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'a@b.com', password_hash: 'hash', role: 'admin' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await login('a@b.com', '123');
      expect(result).toHaveProperty('token');
    });

    it('密碼錯誤拋錯', async () => {
      (authRepo.findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, password_hash: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('AuthService.validateCustomer', () => {
    it('驗證成功回傳客戶資料（無密碼）', async () => {
      const fakeCust = { id: 1, phone: '0912', password_hash: 'hash', name: '王' };
      (prisma.customer.findFirst as jest.Mock).mockResolvedValue(fakeCust);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const svc = new AuthService();
      const result = await svc.validateCustomer('0912', '123');
      expect(result).not.toHaveProperty('password_hash');
    });
  });
});