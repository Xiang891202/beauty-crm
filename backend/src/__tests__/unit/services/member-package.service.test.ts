import * as mpService from '@/services/member-package.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

// helper: 建立 supabase chain mock
function mockChain(overrides: any = {}) {
  return {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    ...overrides,
  };
}

describe('member-package.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('purchasePackage', () => {
    it('購買成功並建立會員組合包', async () => {
      const fakePkg = {
        id: 'pkg-1',
        name: '基礎組',
        items: [{ service_id: 1, quantity: 2 }, { service_id: 2, quantity: 1 }],
      };
      const fakeMemberPkg = { id: 'mp-1', remaining_uses: 3, status: 'active' };

      // mock supabase chain for getting package template
      const getPkgChain = mockChain({
        single: jest.fn().mockResolvedValue({ data: fakePkg, error: null }),
      });
      // mock for inserting member package
      const insertChain = mockChain({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: fakeMemberPkg, error: null }),
      });
      // mock for inserting snapshot items
      const snapshotChain = mockChain();
      mockFrom
        .mockReturnValueOnce(getPkgChain)  // service_packages
        .mockReturnValueOnce(insertChain)  // member_service_packages
        .mockReturnValueOnce(snapshotChain); // member_service_package_items

      const result = await mpService.purchasePackage(1, 'pkg-1', '2026-04-29');
      expect(result.id).toBe('mp-1');
    });

    it('組合包不存在時拋錯', async () => {
      const chain = mockChain({ single: jest.fn().mockResolvedValue({ data: null, error: null }) });
      mockFrom.mockReturnValue(chain);
      await expect(mpService.purchasePackage(1, 'invalid')).rejects.toThrow('組合包不存在');
    });
  });

  describe('useService', () => {
    it('扣減總次數成功並記錄', async () => {
      const memberPkg = { remaining_uses: 3, customer_id: 1, snapshot_name: '基礎組' };
      const usageLog = { id: 'log-1' };

      const findChain = mockChain({ single: jest.fn().mockResolvedValue({ data: memberPkg, error: null }) });
      const updateChain = mockChain({ eq: jest.fn().mockResolvedValue({ error: null }) });
      const insertLogChain = mockChain({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: usageLog, error: null }),
      });
      const itemsInsertChain = mockChain();

      mockFrom
        .mockReturnValueOnce(findChain)       // member_service_packages 查詢
        .mockReturnValueOnce(updateChain)     // 更新剩餘次數
        .mockReturnValueOnce(insertLogChain)  // service_usage_logs 插入
        .mockReturnValueOnce(itemsInsertChain); // service_usage_items

      const result = await mpService.useService({
        member_package_id: 'mp-1',
        selected_service_ids: [1, 2],
        signature_url: 'sig',
      });
      expect(result.id).toBe('log-1');
    });

    it('剩餘次數不足時拋錯', async () => {
      const chain = mockChain({ single: jest.fn().mockResolvedValue({ data: { remaining_uses: 0 }, error: null }) });
      mockFrom.mockReturnValue(chain);
      await expect(mpService.useService({
        member_package_id: 'mp-1',
        selected_service_ids: [1],
        signature_url: 'sig',
      })).rejects.toThrow('剩餘次數不足');
    });

    it('簽名為空時拋錯', async () => {
      const chain = mockChain({ single: jest.fn().mockResolvedValue({ data: { remaining_uses: 1 }, error: null }) });
      mockFrom.mockReturnValue(chain);
      await expect(mpService.useService({
        member_package_id: 'mp-1',
        selected_service_ids: [1],
        signature_url: '',
      })).rejects.toThrow('簽名為必填項目');
    });
  });

  describe('adjustRemaining', () => {
    it('增加次數並寫入 adjustments 表', async () => {
      const memberPkg = { remaining_uses: 2, customer_id: 1, snapshot_name: '組', status: 'active' };
      const findChain = mockChain({ single: jest.fn().mockResolvedValue({ data: memberPkg, error: null }) });
      const updateChain = mockChain({ eq: jest.fn().mockResolvedValue({ error: null }) });
      const adjInsertChain = mockChain({ insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) });
      mockFrom
        .mockReturnValueOnce(findChain)
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(adjInsertChain);

      const result = await mpService.adjustRemaining({ member_package_id: 'mp-1', delta: 2, reason: '補償' });
      expect(result.new_remaining).toBe(4);
    });

    it('扣減後不得小於 0', async () => {
      const memberPkg = { remaining_uses: 1 };
      const chain = mockChain({ single: jest.fn().mockResolvedValue({ data: memberPkg, error: null }) });
      mockFrom.mockReturnValue(chain);
      await expect(mpService.adjustRemaining({ member_package_id: 'mp-1', delta: -5 }))
        .rejects.toThrow('剩餘次數不能為負數');
    });
  });

  describe('useService - 過期處理', () => {
  // TODO: 當 useService 加入過期檢查後，取消 skip 並確保測試通過
  it.skip('套餐已過期時應拒絕使用，即使剩餘次數足夠', async () => {
    const memberPkg = {
      remaining_uses: 3,
      customer_id: 1,
      snapshot_name: '過期組',
    };
    // 模擬查詢套餐（已過期）
    const findChain = mockChain({ 
      single: jest.fn().mockResolvedValue({ data: memberPkg, error: null }) 
    });
    mockFrom.mockReturnValueOnce(findChain);

    // 預期拋出「套餐已過期」的錯誤（需在 useService 中實作）
    await expect(mpService.useService({
      member_package_id: 'mp-1',
      selected_service_ids: [1],
      signature_url: 'sig',
      })).rejects.toThrow('套餐已過期');
    });
  });
});