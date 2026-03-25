import { Request, Response } from 'express';
import * as memberService from '../services/member.service';
import { successResponse, errorResponse } from '../utils/response';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await memberService.getAllMembers();
    res.json(successResponse(members));
  } catch (err) {
    console.error('Error in getMembers:', err);
    res.status(500).json(errorResponse('Failed to fetch members', 500));
  }
};

export const getMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const member = await memberService.getMember(id);
    if (!member) {
      return res.status(404).json(errorResponse('Member not found', 404));
    }
    res.json(successResponse(member));
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
  } catch (err) {
    console.error('Error in updateMember:', err);
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
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error('Error in deleteMember:', err);
    res.status(500).json(errorResponse('Failed to delete member', 500));
  }
};