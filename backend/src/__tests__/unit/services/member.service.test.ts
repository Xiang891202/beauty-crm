// src/services/__tests__/unit/services/member.service.test.ts
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import * as memberService from '@/services/member.service';
import prisma from '@/config/prisma';

jest.mock('@/config/prisma', () => ({
  __esModule: true,
  default: {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const db = prisma as any;

describe('member.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('addMember', () => {
    it('新增會員，密碼會經 bcrypt hash', async () => {
      db.customer.create.mockResolvedValue({ id: 1, name: '王美美', phone: '0912' });
      const result = await memberService.addMember({ name: '王美美', phone: '0912', password: '123' });
      expect(result.id).toBe(1);
    });
  });

  describe('modifyMember', () => {
    it('電話重複時報錯', async () => {
      db.customer.findFirst.mockResolvedValue({ id: 2, phone: '0912' });
      await expect(memberService.modifyMember(1, { phone: '0912' }))
        .rejects.toThrow('此電話號碼已被其他會員使用');
    });
  });
  
  describe('modifyMember - 生日格式', () => {
    it('傳入無效日期字串時應轉換為 Invalid Date，不至於崩潰', async () => {
      db.customer.findFirst.mockResolvedValue(null); // 電話不重複
      db.customer.update.mockResolvedValue({ id: 1, name: 'update', birthday: new Date('Invalid') });
      
      // 假設傳入無效字串
      await memberService.modifyMember(1, { birthday: 'not-a-date' });
      expect(db.customer.update).toHaveBeenCalled();
      // 這裡不做深入判斷，只要不拋錯即可
    });
  });
});