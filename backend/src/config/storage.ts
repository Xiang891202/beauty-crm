import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
console.log('SUPABASE_URL:', env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY);