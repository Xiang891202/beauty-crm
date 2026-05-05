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

    //1. 驗證必要欄位
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

// backend/src/controllers/service_log.controller.ts
export const listUsages = async (req: Request, res: Response) => {
  try {
    const { customer_id, customer_name, startDate, endDate, page, limit } = req.query;
    const result = await usageService.getUnifiedList({
      customer_id: customer_id ? Number(customer_id) : undefined,
      customer_name: customer_name as string,   // 新增
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(successResponse(result));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
};

export const updateUsageNotes = async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId; // 確保 id 是字串
    const { notes } = req.body;

    // 判斷 ID 是否為數字（傳統服務的 service_logs.id）
    const numericId = Number(id);
    if (!isNaN(numericId) && id.trim() !== '') {
      // 傳統服務紀錄
      const updated = await usageService.updateNotes(numericId, notes);
      return res.json(successResponse(updated));
    }

    // 組合包紀錄：直接更新 Supabase service_usage_logs
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase
      .from('service_usage_logs')
      .update({ notes })
      .eq('id', id);

    if (error) throw new Error(error.message);

    res.json(successResponse({ id, notes }));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

// backend/src/controllers/service_log.controller.ts
export const getMyServiceLogs = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const logs = await prisma.serviceLog.findMany({
      where: { customer_id: customerId },
      include: { service: true, member_service: true },
      orderBy: { used_at: 'desc' }
    });
    res.json(successResponse(logs));
  } catch (err) {
    console.error('Error in getMyServiceLogs:', err);
    res.status(500).json(errorResponse('無法取得使用紀錄', 500));
  }
};