// src/services/__tests__/unit/services/signature.service.test.ts
jest.mock('@/config/env', () => ({
  env: {
    SUPABASE_URL: 'https://mock.supabase.co',
    SUPABASE_ANON_KEY: 'mock-anon-key',
    SUPABASE_BUCKET: 'signatures',
  },
}));
jest.mock('@/config/storage');

import { SignatureService } from '@/services/signature.service';
import { supabase } from '@/config/storage';

describe('SignatureService', () => {
  it('上傳成功回傳公開網址', async () => {
    const file = { originalname: 'sig.png', buffer: Buffer.from(''), mimetype: 'image/png' } as any;
    const url = await SignatureService.upload(file);
    expect(url).toBe('https://mock.supabase.co/fake-url');
  });
});