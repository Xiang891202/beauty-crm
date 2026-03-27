import { Request, Response } from 'express';
import * as memberServiceService from '../services/member_service.service';
import { successResponse, errorResponse } from '../utils/response';

export const getMemberServices = async (req: Request, res: Response) => {
  try {
    const customer_id = req.query.customer_id ? Number(req.query.customer_id) : undefined;
    const list = await memberServiceService.getAllMemberServices(customer_id);
    res.json(successResponse(list));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to fetch member services', 500));
  }
};

export const getMemberService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const ms = await memberServiceService.getMemberServiceById(id);
    res.json(successResponse(ms));
  } catch (err: any) {
    console.error(err);
    const status = err.message === '服務配額不存在' ? 404 : 500;
    res.status(status).json(errorResponse(err.message, status));
  }
};

export const createMemberService = async (req: Request, res: Response) => {
  try {
    const { customer_id, service_id, total_sessions, expiry_date } = req.body;
    if (!customer_id || !service_id || !total_sessions) {
      return res.status(400).json(errorResponse('缺少必要欄位', 400));
    }
    const ms = await memberServiceService.createMemberService({
      customer_id,
      service_id,
      total_sessions,
      expiry_date: expiry_date ? new Date(expiry_date) : undefined,
    });
    res.status(201).json(successResponse(ms));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to create member service', 500));
  }
};

export const updateMemberService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const ms = await memberServiceService.updateMemberService(id, req.body);
    res.json(successResponse(ms));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to update member service', 500));
  }
};

export const deleteMemberService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await memberServiceService.deleteMemberService(id);
    res.status(204).send();
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || 'Failed to delete member service', 500));
  }
};