import { Request, Response } from 'express';
import * as memberServiceService from '../services/member_service.service';
import { successResponse, errorResponse } from '../utils/response';
import prisma from '../config/prisma';

// 管理員取客戶服務授權
export const getMemberServicesByCustomer = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const customerId = parseInt(req.params.customerId as string);
    if (isNaN(customerId)) {
      return res.status(400).json(errorResponse('無效客戶ID', 400));
    }
    const where: any = { customer_id: customerId };
    if (tenantId) where.tenant_id = tenantId;
    const memberServices = await prisma.memberService.findMany({
      where,
      include: { service: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(successResponse(memberServices));
  } catch (err) {
    console.error('Error in getMemberServicesByCustomer:', err);
    res.status(500).json(errorResponse('無法取得服務授權', 500));
  }
};

// 客戶取得自己的服務授權（只顯示有剩餘次數的）
export const getMyMemberServices = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const tenantId = (req as any).tenant_id;
    const where: any = {
      customer_id: customerId,
      remaining_sessions: { gt: 0 },
    };
    if (tenantId) where.tenant_id = tenantId;
    const memberServices = await prisma.memberService.findMany({
      where,
      include: { service: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(successResponse(memberServices));
  } catch (err) {
    console.error('Error in getMyMemberServices:', err);
    res.status(500).json(errorResponse('無法取得服務授權', 500));
  }
};

// 客戶查看已用完的服務授權
export const getMyUsedServices = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const tenantId = (req as any).tenant_id;
    const where: any = {
      customer_id: customerId,
      remaining_sessions: 0,
    };
    if (tenantId) where.tenant_id = tenantId;
    const memberServices = await prisma.memberService.findMany({
      where,
      include: { service: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(successResponse(memberServices));
  } catch (err) {
    console.error('Error in getMyUsedServices:', err);
    res.status(500).json(errorResponse('無法取得歷史服務', 500));
  }
};

export const createMemberService = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { customer_id, service_id, total_sessions, expiry_date } = req.body;
    if (!customer_id || !service_id || !total_sessions) {
      return res.status(400).json(errorResponse('缺少必要欄位', 400));
    }
    const ms = await memberServiceService.createMemberService({
      customer_id,
      service_id,
      total_sessions,
      expiry_date: expiry_date ? new Date(expiry_date) : undefined,
    }, tenantId);
    res.status(201).json(successResponse(ms));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to create member service', 500));
  }
};

export const updateMemberService = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const id = parseInt(req.params.id as string);
    const ms = await memberServiceService.updateMemberService(id, req.body, tenantId);
    res.json(successResponse(ms));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to update member service', 500));
  }
};

export const deleteMemberService = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const id = parseInt(req.params.id as string);
    await memberServiceService.deleteMemberService(id, tenantId);
    res.status(204).send();
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to delete member service', 500));
  }
};