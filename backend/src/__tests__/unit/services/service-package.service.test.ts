// src/services/__tests__/unit/services/service-package.service.test.ts
import * as pkgService from '@/services/service-package.service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase'); // 使用自動 mock

const mockSupabaseFrom = supabase.from as jest.Mock;

// 輔助：建立一個 mock chain 並設定最終回傳值（仿照自動 mock 的行為）
function setupChain(resolvedData: any) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is', 'in', 'order', 'limit', 'range', 'single', 'maybeSingle'];
  methods.forEach(m => { chain[m] = jest.fn().mockReturnThis(); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

describe('service-package.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 supabase.from 回到原始自動 mock，以便每個測試獨立控制
    mockSupabaseFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: (resolve: any) => resolve({ data: [], error: null }),
    }));
  });

  it('createPackage 寫入主表與品項', async () => {
    // 模擬第一次 supabase.from('service_packages').insert(...).select().single()
    const insertChain = {
      ...setupChain({ data: { id: 'uuid-1', name: '美白組' }, error: null }),
      single: jest.fn().mockResolvedValue({ data: { id: 'uuid-1', name: '美白組' }, error: null }),
    };
    // 模擬第二次 supabase.from('service_package_items').insert(...)
    const itemsChain = { insert: jest.fn().mockReturnThis(), then: (resolve: any) => resolve({ error: null }) };

    // 因為 createPackage 內部還會呼叫 getPackageById，所以還需要第三次 from('service_packages').select().eq().single()
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'uuid-1', name: '美白組', items: [{ quantity: 2 }] }, error: null }),
    };

    mockSupabaseFrom
      .mockReturnValueOnce(insertChain)   // service_packages insert
      .mockReturnValueOnce(itemsChain)     // service_package_items insert
      .mockReturnValueOnce(selectChain);   // service_packages select (for getPackageById)

    const result = await pkgService.createPackage({
      name: '美白組',
      price: 2000,
      items: [{ service_id: 1, quantity: 2 }],
    });
    expect(result.id).toBeDefined();
  });

  it('deletePackage 軟刪除', async () => {
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    mockSupabaseFrom.mockReturnValueOnce(updateChain);
    await expect(pkgService.deletePackage('uuid-1')).resolves.not.toThrow();
  });
});