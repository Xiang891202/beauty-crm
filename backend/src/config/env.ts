import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  // Supabase 設定
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'signatures',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!, // 添加这一行
  DB: { /* 可從 db.ts 管理 */ }
};