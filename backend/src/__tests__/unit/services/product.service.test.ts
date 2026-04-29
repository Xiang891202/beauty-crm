// src/services/__tests__/unit/services/product.service.test.ts
jest.mock('@/utils/upload', () => ({})); // 阻止 supabase 初始化
jest.mock('@/lib/supabase');

import * as productService from '@/services/product.service';
import * as repo from '@/repositories/product.repo';

jest.mock('@/repositories/product.repo');

describe('product.service', () => {
  it('getAllProducts', async () => {
    (repo.getProducts as jest.Mock).mockResolvedValue([{ id: 1, name: '精華液' }]);
    const list = await productService.getAllProducts();
    expect(list[0].name).toBe('精華液');
  });
});