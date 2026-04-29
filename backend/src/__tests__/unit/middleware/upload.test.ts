// src/__tests__/unit/middleware/upload.test.ts
import { Request, Response, NextFunction } from 'express';

// mock multer 必須包含 memoryStorage 方法
jest.mock('multer', () => {
  const multerMock: any = jest.fn().mockImplementation(() => ({
    single: jest.fn().mockReturnValue(
      (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
          next();
        } else {
          next(new Error('No file uploaded'));
        }
      }
    ),
  }));
  multerMock.memoryStorage = jest.fn(() => 'fake-storage');
  return multerMock;
});

import { upload } from '@/middleware/upload';

describe('upload middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('multer middleware 應為 function', () => {
    const middleware = upload.single('signature');
    expect(typeof middleware).toBe('function');
  });

  it('無檔案時應傳遞錯誤給 next', () => {
    const middleware = upload.single('signature');
    req.file = undefined;
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('有檔案時應呼叫 next 且無錯誤', () => {
    const middleware = upload.single('signature');
    req.file = { filename: 'test.png' } as Express.Multer.File;
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(); // 無錯誤參數
  });
});