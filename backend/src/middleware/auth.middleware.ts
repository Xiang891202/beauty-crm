import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../types';
import jwt from 'jsonwebtoken';
// import { error } from 'node:console';

//身分驗證中間件
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('Authenticate middleware called'); // 可暫時加入日誌確認是否被調用

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

//角色權限中間件
export const roleMiddleware  = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - No user context'});
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden - Requires one of roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};