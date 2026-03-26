// src/controllers/usage.controller.ts
import { Request, Response } from 'express';
import { ServiceLogService } from '../services/service_log.service';
import { successResponse, errorResponse } from '../utils/response';
import { subscribe } from 'node:diagnostics_channel';

const usageService = new ServiceLogService();

export const createUsage = async (req: Request, res: Response) => {
  try {
    const usageData = req.body;
    const createdBy = (req as any).user?.id;
    if (!createdBy) throw new Error('Unauthorized');

    // 构造正确的数据对象，使用数据库字段名
    const createData = {
      customer_id: usageData.customer_id,
      service_id: usageData.service_id,
      used_at: usageData.used_at,
      notes: usageData.notes,
      signature_url: usageData.signature_url,
      created_by: createdBy,   // 关键：使用 created_by 字段
    };

    const newUsage = await usageService.create(createData);
    res.json(successResponse(newUsage));
  } catch (error: any) {
    const status = error.status || 400;
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usage = await usageService.getById(Number(id));
    // successResponse(res, 200, 'Usage record retrieved', usage);
    res.json(successResponse(usage));
  } catch (error: any) {
    const status = error.status || 404 ;
    // errorResponse(res, 404, error.message);
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const listUsages = async (req: Request, res: Response) => {
  try {
    const { customer_id, service_id, startDate, endDate, page, limit } = req.query;
    const result = await usageService.list({
      customer_id: customer_id ? Number(customer_id) : undefined,
      service_id: service_id ? Number(service_id) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(successResponse(result));
  } catch (error: any) {
    const status = error.status || 400;
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const updateUsageNotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const updated = await usageService.updateNotes(Number(id), notes);
    // successResponse(res, 200, 'Usage notes updated', updated);
    res.json(successResponse(updated));
  } catch (error: any) {
    const status = error.status || 400;
    // errorResponse(res, 400, error.message);
    res.status(status).json(errorResponse(error.message, status));
  }
};