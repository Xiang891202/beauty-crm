import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ServiceLogService } from '../services/service_log.service';
import { SignatureService } from '../services/signature.service';
import { successResponse, errorResponse } from '../utils/response';
import { InsufficientQuotaError } from '../types/errors';

const usageService = new ServiceLogService();

export const createUsage = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
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

    const createData: any = {
      member_service_id: Number(member_service_id),
      customer_id: Number(customer_id),
      service_id: service_id ? Number(service_id) : null,
      used_at: used_at ? new Date(used_at) : new Date(),
      notes: notes || null,
      signature_url: signatureUrl,
      created_by: createdBy,
    };

    const newUsage = await usageService.create(createData, tenantId);
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
    const tenantId = (req as any).tenant_id;
    const { id } = req.params;
    const usage = await usageService.getById(Number(id), tenantId);
    res.json(successResponse(usage));
  } catch (error: any) {
    const status = error.status || 404;
    res.status(status).json(errorResponse(error.message, status));
  }
};

export const listUsages = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { customer_id, customer_name, startDate, endDate, page, limit } = req.query;
    const result = await usageService.getUnifiedList({
      customer_id: customer_id ? Number(customer_id) : undefined,
      customer_name: customer_name as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      tenantId,
    });
    res.json(successResponse(result));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
};

export const updateUsageNotes = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { notes } = req.body;

    const numericId = Number(id);
    if (!isNaN(numericId) && id.trim() !== '') {
      const updated = await usageService.updateNotes(numericId, notes, tenantId);
      return res.json(successResponse(updated));
    }

    // 组合包日志，使用Supabase更新，并验证租户
    const { supabase } = await import('../lib/supabase');
    let updateQuery = supabase.from('service_usage_logs').update({ notes }).eq('id', id);
    if (tenantId) updateQuery = updateQuery.eq('tenant_id', tenantId);
    const { error } = await updateQuery;
    if (error) throw new Error(error.message);

    res.json(successResponse({ id, notes }));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

export const getMyServiceLogs = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const tenantId = (req as any).tenant_id; // 客户也属于某个租户，确保只能看到自己租户的日志
    const where: any = { customer_id: customerId };
    if (tenantId) where.tenant_id = tenantId;
    const logs = await prisma.serviceLog.findMany({
      where,
      include: { service: true, member_service: true },
      orderBy: { used_at: 'desc' }
    });
    res.json(successResponse(logs));
  } catch (err) {
    console.error('Error in getMyServiceLogs:', err);
    res.status(500).json(errorResponse('無法取得使用紀錄', 500));
  }
};