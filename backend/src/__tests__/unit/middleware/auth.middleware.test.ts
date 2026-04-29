import { authenticate, roleMiddleware, authMiddleware } from '@/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as jwtUtil from '@/utils/jwt';

// mock jwt and utilities
jest.mock('@/utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

describe('authenticate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('無 Authorization header 應回傳 401', () => {
    authenticate(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('token 驗證失敗回傳 401', () => {
    req.headers = { authorization: 'Bearer bad_token' };
    (jwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    authenticate(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('token 合法應呼叫 next 並設定 user', () => {
    req.headers = { authorization: 'Bearer good_token' };
    const decoded = { id: 1, role: 'admin' };
    (jwtUtil.verifyToken as jest.Mock).mockReturnValue(decoded);
    authenticate(req as Request, res as Response, next);
    expect((req as any).user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});

describe('roleMiddleware', () => {
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

  it('若無 user，回傳 401', () => {
    const middleware = roleMiddleware(['admin']);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('若 user role 不在允許清單內，回傳 403', () => {
    (req as any).user = { role: 'staff' };
    const middleware = roleMiddleware(['admin']);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('若 user role 在允許清單內，呼叫 next', () => {
    (req as any).user = { role: 'admin' };
    const middleware = roleMiddleware(['admin', 'manager']);
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('authMiddleware (JWT)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('無 token 回傳 401', () => {
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('invalid token 回傳 401', () => {
    req.headers = { authorization: 'Bearer badtoken' };
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid'); });
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('valid token 設定 user 並呼叫 next', () => {
    req.headers = { authorization: 'Bearer goodtoken' };
    const user = { id: 1, role: 'admin' };
    jest.spyOn(jwt, 'verify').mockReturnValue(user as any);
    authMiddleware(req as Request, res as Response, next);
    expect((req as any).user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});