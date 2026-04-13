import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || (user.role !== 'admin' && !user.is_admin)) {
    return res.status(403).json(errorResponse('需要管理員權限', 403));
  }
  next();
};