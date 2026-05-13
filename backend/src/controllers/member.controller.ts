import { Request, Response } from 'express';
import prisma from '../config/prisma';
import * as memberService from '../services/member.service';
import { successResponse, errorResponse } from '../utils/response';

// 取得所有會員
export const getMembers = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id; // 中间件保证一定存在
    const members = await memberService.getAllMembersForAdmin(tenantId);
    res.json(successResponse(members));
  } catch (err) {
    console.error('Error in getMembers:', err);
    res.status(500).json(errorResponse('Failed to fetch members', 500));
  }
};

// 取得單一會員
export const getMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const tenantId = (req as any).tenant_id;
    const member = await memberService.getMember(id, tenantId);
    if (!member) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    const { password_hash, ...memberWithoutPassword } = member;
    res.json(successResponse(memberWithoutPassword));
  } catch (err) {
    console.error('Error in getMember:', err);
    res.status(500).json(errorResponse('Failed to fetch member', 500));
  }
};

// 新增會員
export const createMember = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const member = await memberService.addMember(req.body, tenantId);
    res.status(201).json(successResponse(member));
  } catch (err) {
    console.error('Error in createMember:', err);
    res.status(500).json(errorResponse('Failed to create member', 500));
  }
};

// 更新會員
export const updateMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const tenantId = (req as any).tenant_id;
    const member = await memberService.modifyMember(id, req.body, tenantId);
    if (!member) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    res.json(successResponse(member));
  } catch (err: any) {
    console.error('Error in updateMember:', err);
    if (err.message === '此電話號碼已被其他會員使用') {
      return res.status(409).json(errorResponse(err.message, 409));
    }
    res.status(500).json(errorResponse('Failed to update member', 500));
  }
};

// 刪除會員
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const tenantId = (req as any).tenant_id;
    const success = await memberService.removeMember(id, tenantId);
    if (!success) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error in deleteMember:', err);
    res.status(500).json(errorResponse('Failed to delete member', 500));
  }
};

// 取得會員的服務包（保持原有邏輯不變，你可以根據需要加上 tenant 過濾）
export const getMemberServices = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json(errorResponse('Invalid member ID', 400));
    }

    const memberServices = await prisma.memberService.findMany({
      where: { customer_id: id },
      include: {
        service: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(successResponse(memberServices));
  } catch (err) {
    console.error('Error in getMemberServices:', err);
    res.status(500).json(errorResponse('Failed to fetch member services', 500));
  }
};