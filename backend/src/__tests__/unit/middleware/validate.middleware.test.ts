// src/__tests__/unit/middleware/validate.middleware.test.ts
import { validate } from '@/middleware/validate.middleware';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

describe('validate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('資料符合 schema 應呼叫 next', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });
    req.body = { name: 'test' };
    const middleware = validate(schema);
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('資料不符合 schema 應回傳 400，並回傳 errorResponse 格式', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });
    req.body = { name: 123 };
    const middleware = validate(schema);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    // errorResponse 回傳 { error: string, status: number, success: false }
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
        status: 400,
      })
    );
  });

  it('可驗證 query 參數', () => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
    });
    req.query = { page: '1' };
    const middleware = validate(schema, 'query');
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});