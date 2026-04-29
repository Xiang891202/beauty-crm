// 攔截所有 supabase client 建立，避免測試時因缺少環境變數崩潰
jest.mock('@supabase/supabase-js', () => {
  const original = jest.requireActual('@supabase/supabase-js');
  // 建立一個通用的 mock chain，包含所有常見方法
  const createChain = () => {
    const chain: any = {};
    const methods = [
      'select', 'insert', 'update', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
      'is', 'in', 'contains', 'ilike', 'like',
      'order', 'limit', 'range', 'single',
      'maybeSingle', 'head', 'count',
      'mockResolvedValue', 'mockRejectedValue',
    ];
    methods.forEach(m => {
      chain[m] = jest.fn().mockReturnThis();
    });
    // 加上 mockResolvedValue / mockRejectedValue 的快捷
    chain.mockResolvedValue = jest.fn().mockImplementation(function(val: any) {
      // 讓該 chain 可以被 await 並回傳指定值
      return chain;
    });
    return chain;
  };

  return {
    ...original,
    createClient: jest.fn().mockImplementation(() => ({
      from: jest.fn(() => createChain()),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock.supabase.co/fake-url' } }),
        })),
      },
      rpc: jest.fn(),
      auth: {
        signIn: jest.fn(),
        signOut: jest.fn(),
      },
    })),
  };
});

// 避免 bcrypt 拖慢測試
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));