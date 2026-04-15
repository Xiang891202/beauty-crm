// src/controllers/adjustment.controller.ts
import { Request, Response } from 'express';
import { AdjustmentService } from '../services/adjustment.service';
import { successResponse, errorResponse } from '../utils/response';
import prisma from '../config/prisma';

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
    const { member_service_id, member_package_id, customer_name, adjustment_type, endDate, page, limit } = req.query;
    const result = await adjustmentService.list({
      member_service_id: member_service_id ? Number(member_service_id) : undefined,
      member_package_id: member_package_id as string,
      customer_name: customer_name as string,
      adjustment_type: adjustment_type as any,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(successResponse(result));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
};

// backend/src/controllers/adjustment.controller.ts
export const getMyAdjustments = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    // 1. 先查出該客戶的所有 member_service id
    const memberServices = await prisma.memberService.findMany({
      where: { customer_id: customerId },
      select: { id: true },
    });
    const memberServiceIds = memberServices.map(ms => ms.id);
    // 2. 查詢調整紀錄，條件為 member_service_id 在這些 id 中
    const adjustments = await prisma.adjustment.findMany({
      where: { member_service_id: { in: memberServiceIds } },
      include: { member_service: { include: { service: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(successResponse(adjustments));
  } catch (err) {
    console.error('Error in getMyAdjustments:', err);
    res.status(500).json(errorResponse('無法取得調整紀錄', 500));
  }
};