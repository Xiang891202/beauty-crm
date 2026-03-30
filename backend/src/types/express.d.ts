import { User } from './index'; // 假设 User 类型已定义

declare global {
  namespace Express {
    interface Request {
      user?:{
        id: number;
        email: string;
        role: string;
        full_name?: string;
      }; // 或者更具体的类型，如 { id: number; role: string }
    }
  }
}

export {};