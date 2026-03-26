import { Response } from 'express';
import { error } from 'node:console';

//成功 (不直接發送響應)
export const successResponse = (data: any) => ({
  success: true,
  data,
});

//錯誤 (不直接發送響應)
export const errorResponse = (message: string, status = 500) => ({
  success: false,
  error: message,
  status,
});

//錯誤處理中間件 catch 發送錯誤
export const handleError = (res: Response, error: any) => {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json(errorResponse(message, status));
};
