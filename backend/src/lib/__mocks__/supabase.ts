// src/lib/__mocks__/supabase.ts

const createChain = () => {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'is', 'in', 'ilike', 'like',
    'order', 'limit', 'range', 'single',
    'maybeSingle', 'head',
  ];
  methods.forEach(m => {
    chain[m] = jest.fn().mockReturnThis();
  });
  chain.then = (resolve: any) => resolve({ data: [], error: null });
  chain.mockResolvedValue = jest.fn().mockImplementation((val: any) => {
    const newChain = createChain();
    newChain.then = (resolve: any) => resolve(val);
    return newChain;
  });
  return chain;
};

export const supabase = {
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
};