// src/services/__tests__/unit/services/service.service.test.ts
jest.mock('@/utils/upload', () => ({})); // 阻止 supabase 初始化
jest.mock('@/lib/supabase');

import * as serviceService from '@/services/service.service';
import * as serviceRepo from '@/repositories/service.repo';

jest.mock('@/repositories/service.repo');

describe('service.service', () => {
  it('createService 成功建立', async () => {
    (serviceRepo.create as jest.Mock).mockResolvedValue({ id: 1, name: '臉部保濕', duration_minutes: 60, price: 800 });
    const result = await serviceService.createService({ name: '臉部保濕', price: 800 });
    expect(result.name).toBe('臉部保濕');
  });

  it('getServices 可篩選包含已刪除', async () => {
    (serviceRepo.findAll as jest.Mock).mockResolvedValue([{ id: 1, name: 'S' }]);
    const list = await serviceService.getServices(false);
    expect(list).toHaveLength(1);
  });
});