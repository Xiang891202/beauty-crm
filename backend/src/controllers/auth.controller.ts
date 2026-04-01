import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { customerLoginSchema } from '../validators/auth.validator';
import { validate } from '../middleware/validate.middleware';
import { generateToken } from '../utils/jwt'
import { ApiError } from '../types/errors';
// import '../types/express.d.ts'; // 确保全局类型扩展被加载

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

const authService = new AuthService();

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

export const getProfile = async (req: Request, res: Response) => {
  res.json({ success: true, data: (req as any).user });
};

//新增客戶登入控制器
export const customerLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    // 調用 service 驗證客戶
    const customer = await authService.validateCustomer(phone, password);
    if (!customer) {
      throw new ApiError(401, '電話號碼或密碼錯誤');
    }

    // 生成 JWT token
    const token = generateToken({ 
      id: customer.id, 
      phone: customer.phone,
      email: customer.email, 
      role: 'customer'
    });

    res.json(successResponse({ token, user: customer }));
  } catch (err) {
    next(err);
  }
};
