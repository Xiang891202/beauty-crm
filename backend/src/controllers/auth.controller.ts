import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { loginSchema } from '../validators/auth.validator';
import { generateToken } from '../utils/jwt'

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const result = await authService.login(email, password);
//     res.json(successResponse(result));
//   } catch (err: any) {
//     const status = err.status || 401;
//     res.status(status).json(errorResponse(err.message, status));
//   }
// };

// export const register = async (req: Request, res: Response) => {
//   try {
//     const result = await authService.register(req.body);
//     res.status(201).json(successResponse(result));
//   } catch (err: any) {
//     const status = err.status || 400;
//     res.status(status).json(errorResponse(err.message, status));
//   }
// };

//硬編碼認證 測試登入接口返回 token 值

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 临时硬编码验证（测试用）
  if (email === 'test@gmail.com' && password === '123456') {
    const token = generateToken({ id: 1, email, role: 'admin' });
    return res.json(successResponse({ token, user: { id: 1, email, role: 'admin' } }));
  }

  return res.status(401).json(errorResponse('Invalid credentials', 401));
};

// register 可以暂时返回提示或简单实现
export const register = async (req: Request, res: Response) => {
  // 可选：临时返回成功，或者调用 service 创建用户（需先实现）
  return res.json(successResponse({ message: 'Register endpoint not implemented' }));
};