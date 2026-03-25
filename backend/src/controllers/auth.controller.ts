import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { loginSchema } from '../validators/auth.validator';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(successResponse(result));
  } catch (err: any) {
    const status = err.status || 401;
    res.status(status).json(errorResponse(err.message, status));
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result));
  } catch (err: any) {
    const status = err.status || 400;
    res.status(status).json(errorResponse(err.message, status));
  }
};