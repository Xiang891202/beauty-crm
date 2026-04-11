import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/errors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  // 如果是自定義的 ApiError，使用其狀態碼與訊息
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  // 其他錯誤一律回傳 500
  res.status(500).json({ error: 'Internal Server Error' });
};