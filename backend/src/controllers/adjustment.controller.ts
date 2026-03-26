// src/controllers/adjustment.controller.ts
import { Request, Response } from 'express';
import { AdjustmentService } from '../services/adjustment.service';
import { successResponse, errorResponse } from '../utils/response';

const adjustmentService = new AdjustmentService();

export const createAdjustment = async (req: Request, res: Response) => {
  try {
    const adjustmentData = req.body;
    const created_by = (req as any).user?.id;
    if (!created_by) throw new Error('Unauthorized');

    const newAdj = await adjustmentService.createAdjustment({ ...adjustmentData, created_by });
    // successResponse(res, 201, 'Adjustment record created', newAdj);
    res.json(successResponse(newAdj));
  } catch (error: any) {
    const status = error.status || 400;
    // errorResponse(res, 400, error.message);
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const getAdjustment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adj = await adjustmentService.getById(Number(id));
    // successResponse(res, 200, 'Adjustment record retrieved', adj);
    res.json(successResponse(adj));
  } catch (error: any) {
    const status = error.status || 404;
    // errorResponse(res, 404, error.message);
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const listAdjustments = async (req: Request, res: Response) => {
  try {
    const { usageId, productId, type, startDate, endDate, page, limit } = req.query;
    const result = await adjustmentService.list({
      usageId: usageId ? Number(usageId) : undefined,
      productId: productId ? Number(productId) : undefined,
      type: type as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    // successResponse(res, 200, 'Adjustment list retrieved', result);
    res.json(successResponse(result));
  } catch (error: any) {
    const status = error.status || 400;
    // errorResponse(res, 400, error.message);
    res.status(status).json(errorResponse(error.message, status));
  }
};