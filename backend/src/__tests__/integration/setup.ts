// src/__tests__/integration/setup.ts

// ========== 必須在任何 import 之前 mock 會初始化 supabase 的模組 ==========
jest.mock('@/utils/upload', () => ({}));        // 阻止 upload.ts 執行
jest.mock('@/lib/supabase');                    // 使用 src/lib/__mocks__/supabase.ts
jest.mock('@/config/storage');                  // 使用 src/config/__mocks__/storage.ts

// 全域 mock prisma
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
      count: jest.fn(),
    },
    memberService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    serviceLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    service: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    adjustment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(prisma)),
  },
}));

// 設定環境變數，避免 jwt 等模組出錯
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';
process.env.SUPABASE_BUCKET = 'test-bucket';

export const prisma = require('@/config/prisma').default;