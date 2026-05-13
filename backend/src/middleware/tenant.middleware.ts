import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: '请先登录' });

    // 管理員直接放行，不強制捆綁租戶
    if (user.role === 'admin') {
      return next();
    }

    let tenantId: number | null = null;

    if (user.role === 'customer') {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT tenant_id FROM customers WHERE id = $1 LIMIT 1`,
        user.id
      );
      tenantId = result[0]?.tenant_id;
    } else {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT tenant_id FROM users WHERE id = $1 LIMIT 1`,
        user.id
      );
      tenantId = result[0]?.tenant_id;
    }

    if (!tenantId) {
      return res.status(403).json({ message: '未关联到任何租户' });
    }

    (req as any).tenant_id = tenantId;
    next();
  } catch (err) {
    console.error('tenantContext error:', err);
    return res.status(500).json({ message: '伺服器內部錯誤' });
  }
};