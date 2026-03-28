import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// 使用服务角色密钥（有全部权限，可绕过 RLS）
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

console.log('Supabase 客户端已初始化（服务角色模式）');
console.log('URL:', env.SUPABASE_URL);