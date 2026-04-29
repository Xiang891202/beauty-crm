// src/services/__tests__/unit/services/service_log.service.test.ts
import { ServiceLogService } from '@/services/service_log.service';
import { ServiceLogRepository } from '@/repositories/service_log.repo';
import prisma from '@/config/prisma';
import { InsufficientQuotaError } from '@/types/errors';
import { supabase } from '@/lib/supabase';

jest.mock('@/repositories/service_log.repo');
jest.mock('@/config/prisma', () => ({
  __esModule: true,
  default: {
    memberService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    serviceLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));
jest.mock('@/lib/supabase'); // 自動 mock

const mockSupabaseFrom = supabase.from as jest.Mock;

// 輔助：建立 mock chain 並自訂 then 回傳值
function chainWithThen(data: any) {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'is', 'in', 'ilike', 'like',
    'order', 'limit', 'range', 'single', 'maybeSingle',
  ];
  methods.forEach(m => { chain[m] = jest.fn().mockReturnThis(); });
  chain.then = (resolve: any) => resolve(data);
  return chain;
}

describe('ServiceLogService', () => {
  let service: ServiceLogService;
  let mockRepo: jest.Mocked<ServiceLogRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ServiceLogService();
    mockRepo = new ServiceLogRepository() as jest.Mocked<ServiceLogRepository>;
    (service as any).repo = mockRepo;

    // 重置 supabase.from 為原始自動 mock
    mockSupabaseFrom.mockImplementation(() => chainWithThen({ data: [], error: null }));
  });

  // 原有的 create / getById / update 測試（保留）
  describe('create', () => {
    it('无 member_service_id 时直接调用 repository 的 create', async () => {
      const data = {
        customer_id: 1,
        member_service_id: null,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      const expected = { id: 1, ...data };
      mockRepo.create.mockResolvedValue(expected as any);
      const result = await service.create(data);
      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(expected);
    });

    it('应该在有 member_service_id 且剩余次数足够时扣减', async () => {
      const data = {
        customer_id: 1,
        member_service_id: 10,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue({ remaining_sessions: 5 });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({
          serviceLog: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          memberService: { update: jest.fn() },
        });
      });
      const result = await service.create(data);
      expect(result.id).toBe(1);
    });

    it('找不到服務授權報錯', async () => {
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create({
        customer_id: 1, member_service_id: 10, service_id: 2, used_at: new Date(), notes: '', signature_url: '', created_by: 1,
      })).rejects.toThrow('找不到該服務授權');
    });

    it('次數不足報 InsufficientQuotaError', async () => {
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue({ remaining_sessions: 0 });
      await expect(service.create({
        customer_id: 1, member_service_id: 10, service_id: 2, used_at: new Date(), notes: '', signature_url: '', created_by: 1,
      })).rejects.toThrow(InsufficientQuotaError);
    });
  });

  describe('getById', () => {
    it('返回記錄', async () => {
      mockRepo.findById.mockResolvedValue({ id: 1 } as any);
      const result = await service.getById(1);
      expect(result.id).toBe(1);
    });

    it('不存在報錯', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getById(999)).rejects.toThrow('Service log not found');
    });
  });

  describe('updateNotes', () => {
    it('更新 notes', async () => {
      mockRepo.update.mockResolvedValue({ id: 1, notes: 'new' } as any);
      const result = await service.updateNotes(1, 'new');
      expect(mockRepo.update).toHaveBeenCalledWith(1, { notes: 'new' });
      expect(result.notes).toBe('new');
    });
  });

  describe('updateSignature', () => {
    it('更新签名', async () => {
      mockRepo.update.mockResolvedValue({ id: 1, signature_url: 'url' } as any);
      const result = await service.updateSignature(1, 'url');
      expect(mockRepo.update).toHaveBeenCalledWith(1, { signature_url: 'url' });
      expect(result.signature_url).toBe('url');
    });
  });

  // ========== getUnifiedList 測試 ==========
  describe('getUnifiedList', () => {
    const fakeTrad = [{
      id: 1, used_at: new Date(), notes: '', signature_url: null,
      customer: { id: 1, name: '王美美' },
      service: { id: 10, name: '臉部保濕' },
      member_service: { remaining_sessions: 2, total_sessions: 5 },
    }];
    const fakePkg = [{
      id: 100, created_at: new Date().toISOString(), notes: 'pkg', signature_url: 'sig',
      snapshot_package_name: '美白組', customer_id: 1, customer: { name: '王美美' },
      items: [{ service: { name: '去角質' } }],
      member_service_packages: [{ snapshot_name: '美白組' }],
    }];

    beforeEach(() => {
      (prisma.serviceLog.findMany as jest.Mock).mockResolvedValue(fakeTrad);
      (prisma.serviceLog.count as jest.Mock).mockResolvedValue(1);
    });

    it('合併傳統與組合包', async () => {
      // supabase 三次呼叫：package logs, gifts lookups (兩次)
      mockSupabaseFrom
        .mockReturnValueOnce(chainWithThen({ data: fakePkg, count: 1, error: null }))   // service_usage_logs
        .mockReturnValueOnce(chainWithThen({ data: [], error: null }))                 // gifts lookup 1
        .mockReturnValueOnce(chainWithThen({ data: [], count: 0, error: null }));      // gift logs

      const result = await service.getUnifiedList({ page: 1, limit: 10 });
      expect(result.total).toBe(2);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('客戶名稱搜尋無結果時提前返回空', async () => {
      mockSupabaseFrom.mockReturnValueOnce(chainWithThen({ data: [], error: null }));   // customers query
      const result = await service.getUnifiedList({ page: 1, limit: 10, customer_name: '不存在' });
      expect(result.items).toEqual([]);
    });
  });
});