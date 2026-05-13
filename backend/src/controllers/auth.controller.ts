import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { generateToken } from '../utils/jwt'
import { login as authLogin } from '../services/auth.service';
import { ApiError } from '../types/errors';

const authService = new AuthService();

// 管理員登入
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authLogin(email, password); 
    
    // 1. 從 result 或 result.user 中取出管理員資料
    // (依據你的 authLogin 回傳結構而定，若 authLogin 直接回傳 user，則改為 result)
    // 透過強制轉型為 any，解決「類型沒有屬性」的 TypeScript 錯誤
    const user = (result as any).user || result; 

    // 2. 簽發 Token，務必把 id, role 與關鍵的多租戶 tenant_id 放進去
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role || 'admin', 
      tenant_id: user.tenant_id 
    });

    // 3. 同時回傳 token 與 user 資料給前端
    res.json(successResponse({
      token,
      user
    }));

  } catch (err: any) {
    const status = err.status || 401;
    res.status(status).json(errorResponse(err.message, status));
  }
};

export const register = async (req: Request, res: Response) => {
  return res.json(successResponse({ message: 'Register endpoint not implemented' }));
};

export const getProfile = async (req: Request, res: Response) => {
  res.json({ success: true, data: (req as any).user });
};

// 客戶登入
export const customerLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    const customer = await authService.validateCustomer(phone, password);
    if (!customer) {
      throw new ApiError(401, '電話號碼或密碼錯誤');
    }

    // customer 已包含 tenant_id，直接放入 JWT
    const token = generateToken({
      id: customer.id,
      phone: customer.phone,
      email: customer.email,
      role: 'customer',
      tenant_id: (customer as any).tenant_id,   // ← 加这个
    });

    res.json(successResponse({ token, user: customer }));
  } catch (err) {
    next(err);
  }
};