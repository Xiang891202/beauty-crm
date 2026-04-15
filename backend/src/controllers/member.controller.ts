import { Request, Response } from 'express';
import prisma from '../config/prisma';
import * as memberService from '../services/member.service';
import { successResponse, errorResponse } from '../utils/response';

// 取得所有會員（後台列表，不含 notes 與 password_hash）
export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await memberService.getAllMembersForAdmin();
    res.json(successResponse(members));
  } catch (err) {
    console.error('Error in getMembers:', err);
    res.status(500).json(errorResponse('Failed to fetch members', 500));
  }
};

// 取得單一會員（完整資訊，含 notes 等，供編輯表單使用）
export const getMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const member = await memberService.getMember(id);
    if (!member) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    // 排除密碼欄位
    const { password_hash, ...memberWithoutPassword } = member;
    res.json(successResponse(memberWithoutPassword));
  } catch (err) {
    console.error('Error in getMember:', err);
    res.status(500).json(errorResponse('Failed to fetch member', 500));
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const member = await memberService.addMember(req.body);
    res.status(201).json(successResponse(member));
  } catch (err) {
    console.error('Error in createMember:', err);
    res.status(500).json(errorResponse('Failed to create member', 500));
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const member = await memberService.modifyMember(id, req.body);
    if (!member) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    res.json(successResponse(member));
  } catch (err: any) {
    console.error('Error in updateMember:', err);
    // 處理電話重複錯誤
    if (err.message === '此電話號碼已被其他會員使用') {
      return res.status(409).json(errorResponse(err.message, 409));
    }
    res.status(500).json(errorResponse('Failed to update member', 500));
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const success = await memberService.removeMember(id);
    if (!success) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error in deleteMember:', err);
    res.status(500).json(errorResponse('Failed to delete member', 500));
  }
};

// 取得會員的服務包（保持原有邏輯不變）
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