// src/__tests__/unit/services/stats.service.test.ts
import { getDashboardStats } from '@/services/stats.service';
import prisma from '@/config/prisma';
import { supabase } from '@/lib/supabase';

jest.mock('@/config/prisma', () => ({
  __esModule: true,
  default: {
    customer: { count: jest.fn() },
    serviceLog: { count: jest.fn(), findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));
jest.mock('@/lib/supabase');

const mockSupabaseFrom = supabase.from as jest.Mock;

function createChainWithResolved(data: any) {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'is', 'in', 'order', 'limit', 'range', 'head',
  ];
  methods.forEach(m => { chain[m] = jest.fn().mockReturnThis(); });
  chain.then = (resolve: any) => resolve(data);
  return chain;
}

describe('stats.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('回傳儀表板統計', async () => {
    const db = prisma as any;
    db.customer.count.mockResolvedValue(128);
    db.serviceLog.count.mockResolvedValue(50);
    db.serviceLog.findMany.mockResolvedValue([
      {
        id: 1,
        used_at: new Date(),
        notes: null,
        signature_url: null,
        customer: { id: 1, name: '王美美' },
        service: { id: 10, name: '臉部保濕' },
      },
    ]);
    db.$queryRaw.mockResolvedValue([{ date: new Date(), count: BigInt(3) }]);

    mockSupabaseFrom.mockReturnValueOnce(
      createChainWithResolved({ data: null, count: 30, error: null })
    );
    mockSupabaseFrom.mockReturnValueOnce(
      createChainWithResolved({ data: [], error: null })
    );
    mockSupabaseFrom.mockReturnValueOnce(
      createChainWithResolved({ data: [], error: null })
    );

    const stats = await getDashboardStats();
    expect(stats.totalMembers).toBe(128);
    expect(stats.totalUsage).toBe(80);
    expect(stats.recentLogs.length).toBeGreaterThan(0);
  });

  it('無任何使用紀錄時不應報錯，回傳空統計', async () => {
    const db = prisma as any;
    db.customer.count.mockResolvedValue(0);
    db.serviceLog.count.mockResolvedValue(0);
    db.serviceLog.findMany.mockResolvedValue([]);
    db.$queryRaw.mockResolvedValue([]);

    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      head: jest.fn().mockResolvedValue({ count: 0, error: null }),
    });
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({ data: [], error: null }),
    });
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const stats = await getDashboardStats();
    expect(stats.totalMembers).toBe(0);
    expect(stats.totalUsage).toBe(0);
    expect(stats.dailyUsage).toHaveLength(7);
    expect(stats.recentLogs).toEqual([]);
  });
});