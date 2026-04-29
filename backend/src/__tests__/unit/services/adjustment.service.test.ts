import { AdjustmentService } from '@/services/adjustment.service';
import prisma from '@/config/prisma';
import { supabase } from '@/lib/supabase';

jest.mock('@/config/prisma', () => ({
  __esModule: true,
  default: {
    memberService: { findUnique: jest.fn(), update: jest.fn() },
    adjustment: { create: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(prisma)),
  },
}));
jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const db = prisma as any;

describe('AdjustmentService', () => {
  let service: AdjustmentService;
  beforeEach(() => { service = new AdjustmentService(); jest.clearAllMocks(); });

  describe('createAdjustment', () => {
    it('增加次數並建立調整記錄', async () => {
      db.memberService.findUnique.mockResolvedValue({ remaining_sessions: 3 });
      db.memberService.update.mockResolvedValue({});
      db.adjustment.create.mockResolvedValue({ id: 1, adjustment_type: 'INCREASE', amount: 2 });

      const result = await service.createAdjustment({
        member_service_id: 10,
        adjustment_type: 'INCREASE',
        amount: 2,
        reason: '客訴',
        created_by: 99,
      } as any);
      expect(result.adjustment_type).toBe('INCREASE');
    });

    it('減少後不得低於 0', async () => {
      db.memberService.findUnique.mockResolvedValue({ remaining_sessions: 1 });
      await expect(service.createAdjustment({
        member_service_id: 10,
        adjustment_type: 'DECREASE',
        amount: 5,
      } as any)).rejects.toThrow('Cannot decrease below zero');
    });
  });

  describe('list adjustments', () => {
    it('應支援依調整類型與日期過濾，並正確分頁', async () => {
      const fakeData = [
        { id: 1, adjustment_type: 'INCREASE', amount: 2, created_at: new Date().toISOString(), customer: { name: '王美美' } },
        { id: 2, adjustment_type: 'DECREASE', amount: 1, created_at: new Date().toISOString(), customer: { name: '張三' } },
      ];
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };
      // 模擬最終回傳 { data, count, error }
      (mockChain as any).then = (resolve: any) => resolve({ data: fakeData, count: 2, error: null });
      (supabase.from as jest.Mock).mockReturnValueOnce(mockChain);

      const result = await service.list({
        adjustment_type: 'INCREASE',
        endDate: new Date(),
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockChain.eq).toHaveBeenCalledWith('adjustment_type', 'INCREASE');
      expect(mockChain.lte).toHaveBeenCalledWith('created_at', expect.any(String));
      expect(mockChain.range).toHaveBeenCalledWith(0, 9);
    });

    it('查無資料時應回傳空陣列', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };
      (mockChain as any).then = (resolve: any) => resolve({ data: [], count: 0, error: null });
      (supabase.from as jest.Mock).mockReturnValueOnce(mockChain);

      const result = await service.list({ page: 1, limit: 10 });
      expect(result.items).toEqual([]);
    });
  });
});