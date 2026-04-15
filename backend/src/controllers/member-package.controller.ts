import { Request, Response } from 'express';
import * as memberPackageService from '../services/member-package.service';
import { successResponse, errorResponse } from '../utils/response';

import { ServiceLogService } from '../services/service_log.service';
const serviceLogService = new ServiceLogService();

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// 管理員為客戶購買組合包
export const purchasePackageForCustomer = async (req: Request, res: Response) => {
  try {
    const { customer_id, package_id, purchase_date, expiry_date, total_uses } = req.body;
    if (!customer_id || !package_id || !total_uses) {
      return res.status(400).json(errorResponse('缺少 customer_id , package_id , total_uses', 400));
    }
    const result = await memberPackageService.purchasePackage(
      customer_id,
      package_id,
      purchase_date,
      expiry_date,
      total_uses
    );
    res.json(successResponse(result));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '購買組合包失敗', 500));
  }
};

// 查詢客戶的所有組合包（管理員用）
export const getCustomerPackages = async (req: Request, res: Response) => {
  try {
    const customer_id = parseInt(req.query.customer_id as string);
    if (isNaN(customer_id)) {
      return res.status(400).json(errorResponse('無效的 customer_id', 400));
    }
    const packages = await memberPackageService.getCustomerPackages(customer_id);
    res.json(successResponse(packages));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 客戶查詢自己的組合包（從 JWT 取得 customer_id）
export const getMyPackages = async (req: Request, res: Response) => {
  try {
    const customer_id = (req as any).user?.id;
    if (!customer_id) {
      return res.status(401).json(errorResponse('未授權', 401));
    }
    const packages = await memberPackageService.getCustomerPackages(customer_id);
    res.json(successResponse(packages));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 取得單一組合包詳細（含各服務剩餘次數）
export const getMemberPackageDetail = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);  // 修正
    const detail = await memberPackageService.getMemberPackageDetail(id);
    if (!detail) {
      return res.status(404).json(errorResponse('組合包不存在', 404));
    }
    res.json(successResponse(detail));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 扣次使用服務（新版：可選多個品項）
export const useService = async (req: Request, res: Response) => {
  try {
    const { member_package_id, selected_service_ids, notes, signature_url, staff_id, gifts } = req.body;
    if (!member_package_id || !selected_service_ids || !selected_service_ids.length) {
      return res.status(400).json(errorResponse('缺少必要欄位 (member_package_id, selected_service_ids)', 400));
    }
    const created_by = (req as any).user?.id;
    const usage = await memberPackageService.useService({
      member_package_id,
      selected_service_ids,
      notes,
      signature_url,
      staff_id,
      created_by,
      gifts: gifts || [],
    });
    res.json(successResponse(usage));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '扣次失敗', 500));
  }
};

// 查詢使用紀錄（管理員可篩選客戶或組合包）
export const getUsageLogs = async (req: Request, res: Response) => {
  try {
    const { customer_id, member_package_id } = req.query;
    const logs = await memberPackageService.getUsageLogs({
      customer_id: customer_id ? parseInt(customer_id as string) : undefined,
      member_package_id: member_package_id as string,
    });
    res.json(successResponse(logs));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 客戶查詢自己的使用紀錄（含傳統服務 + 組合包 + 贈品）
export const getMyUsageLogs = async (req: Request, res: Response) => {
  try {
    const customer_id = (req as any).user?.id;
    if (!customer_id) {
      return res.status(401).json(errorResponse('未授權', 401));
    }
    // 使用統一的 getUnifiedList，只查該客戶的紀錄（不分頁，一次取較多筆）
    const result = await serviceLogService.getUnifiedList({
      customer_id,
      page: 1,
      limit: 100,
    });
    // 直接回傳 items 陣列（不帶分頁結構）
    res.json(successResponse(result.items || []));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 贈品相關（可選）
export const getGifts = async (req: Request, res: Response) => {
  try {
    const { member_package_id } = req.query;
    const gifts = await memberPackageService.getGifts(member_package_id as string);
    res.json(successResponse(gifts));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

export const getAllGifts = async (req: Request, res: Response) => {
  try {
    const { member_package_id, is_redeemed } = req.query;
    const gifts = await memberPackageService.getAllGifts({
      member_package_id: member_package_id as string,
      is_redeemed: is_redeemed === 'true' ? true : is_redeemed === 'false' ? false : undefined,
    });
    res.json(successResponse(gifts));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const createGift = async (req: Request, res: Response) => {
  try {
    const { member_package_id, gift_description, notes } = req.body;
    if (!member_package_id || !gift_description) {
      return res.status(400).json(errorResponse('缺少必要欄位'));
    }
    const gift = await memberPackageService.createGift({ member_package_id, gift_description, notes });
    res.status(201).json(successResponse(gift));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const updateGift = async (req: Request, res: Response) => {
  try {
    const  id  = getParamId(req.params.id);  // 修正
    const gift = await memberPackageService.updateGift(id, req.body);
    res.json(successResponse(gift));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const deleteGift = async (req: Request, res: Response) => {
  try {
    const  id  = getParamId(req.params.id);  // 修正
    await memberPackageService.deleteGift(id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const redeemGift = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const gift = await memberPackageService.redeemGift(id);
    res.json(successResponse(gift));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const adjustRemaining = async (req: Request, res: Response) => {
  try {
    const { member_package_id, delta, reason, notes } = req.body;
    if (!member_package_id || delta === undefined) {
      return res.status(400).json(errorResponse('缺少必要欄位 (member_package_id, delta)', 400));
    }
    const result = await memberPackageService.adjustRemaining({
      member_package_id,
      delta,
      reason,
      notes,
      created_by: (req as any).user?.id,
    });
    res.json(successResponse(result));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '調整失敗', 500));
  }
};