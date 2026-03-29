// src/controllers/usage.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ServiceLogService } from '../services/service_log.service';
import { SignatureService } from '../services/signature.service';
import { successResponse, errorResponse } from '../utils/response';
import { InsufficientQuotaError } from '../types/errors';

const usageService = new ServiceLogService();

export const createUsage = async (req: Request, res: Response) => {
  try {
    const { member_service_id, customer_id, service_id, used_at, notes } = req.body;
    const createdBy = (req as any).user?.id;
    const signatureFile = req.file;

    if (!createdBy) throw new Error('Unauthorized');
    if (!member_service_id || !customer_id) {
      throw new Error('缺少必要欄位: member_service_id 或 customer_id');
    }

    let signatureUrl: string | undefined;
    if (signatureFile) {
      signatureUrl = await SignatureService.upload(signatureFile);
    }

    const createData = {
      member_service_id: Number(member_service_id),
      customer_id: Number(customer_id),
      service_id: service_id ? Number(service_id) : null,
      used_at: used_at ? new Date(used_at) : new Date(),
      notes: notes || null,
      signature_url: signatureUrl,
      created_by: createdBy,
    };

    const newUsage = await usageService.create(createData);
    const updatedMemberService = await prisma.memberService.findUnique({
      where: { id: Number(member_service_id) },
      select: { remaining_sessions: true }
    });
    res.json(successResponse({
      ...newUsage,
      remaining: updatedMemberService?.remaining_sessions ?? 0
    }));
  } catch (error: any) {
    console.error(error);
    const status = error instanceof InsufficientQuotaError ? 400 : error.status || 400;
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usage = await usageService.getById(Number(id));
    res.json(successResponse(usage));
  } catch (error: any) {
    const status = error.status || 404;
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
    res.json(successResponse(updated));
  } catch (error: any) {
    const status = error.status || 400;
    res.status(status).json(errorResponse(error.message, status));
  }
};