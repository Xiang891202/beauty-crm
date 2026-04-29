import { requireAdmin } from '@/middleware/admin.middleware';
import { Request, Response, NextFunction } from 'express';

describe('requireAdmin middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('若 user 不存在，回傳 403', () => {
    requireAdmin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('若 user.role 非 admin 且 is_admin 非 true，回傳 403', () => {
    (req as any).user = { role: 'staff', is_admin: false };
    requireAdmin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('若 user.role 為 admin，呼叫 next', () => {
    (req as any).user = { role: 'admin' };
    requireAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('若 user.is_admin 為 true，即使 role 非 admin 也放行', () => {
    (req as any).user = { role: 'staff', is_admin: true };
    requireAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});