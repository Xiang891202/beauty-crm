import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    successResponse(res, result);
  } catch (err: any) {
    errorResponse(res, err.message, 401);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    successResponse(res, result, 201);
  } catch (err: any) {
    errorResponse(res, err.message, 400);
  }
};