import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-idempotency-key'] as string;
  if (!key) return next();

  try {
    // 檢查是否已存在
    const { data: existing } = await supabase
      .from('idempotency_records')
      .select('key')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: '重複請求，請勿重複送出',
        status: 409,
      });
    }

    // 建立 record
    await supabase.from('idempotency_records').insert({
      key,
      response: {},
      created_at: new Date().toISOString(),
    });

    // 攔截 res.json 以在回應前更新 record
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      void supabase
        .from('idempotency_records')
        .update({ response: body })
        .eq('key', key);
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error('Idempotency middleware error:', err);
    next();
  }
};