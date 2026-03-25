import { Request, Response } from 'express';
import * as memberService from '../services/member.service';
import { successResponse, errorResponse } from '../utils/response';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await memberService.getAllMembers();
    successResponse(res, members);
  } catch (err) {
    console.error('Error in getMembers:', err);
    errorResponse(res, 'Failed to fetch members');
  }
};

export const getMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const member = await memberService.getMember(id);
    if (!member) return errorResponse(res, 'Member not found', 404);
    successResponse(res, member);
  } catch (err) {
    console.error('Error in getMember:', err);
    errorResponse(res, 'Failed to fetch member');
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const member = await memberService.addMember(req.body);
    successResponse(res, member, 201);
  } catch (err) {
    console.error('Error in createMember:', err);
    errorResponse(res, 'Failed to create member');
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const member = await memberService.modifyMember(id, req.body);
    if (!member) return errorResponse(res, 'Member not found', 404);
    successResponse(res, member);
  } catch (err) {
    console.error('Error in updateMember:', err);
    errorResponse(res, 'Failed to update member');
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const success = await memberService.removeMember(id);
    if (!success) return errorResponse(res, 'Member not found', 404);
    res.status(204).send();
  } catch (err) {
    console.error('Error in deleteMember:', err);
    errorResponse(res, 'Failed to delete member');
  }
};