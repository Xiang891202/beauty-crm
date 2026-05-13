import { Request, Response } from 'express';
import * as memberPackageService from '../services/member-package.service';
import { successResponse, errorResponse } from '../utils/response';
import { SignatureService } from '../services/signature.service';

import { ServiceLogService } from '../services/service_log.service';
const serviceLogService = new ServiceLogService();

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// 管理員為客戶購買組合包
export const purchasePackageForCustomer = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { customer_id, package_id, purchase_date, expiry_date, total_uses } = req.body;
    if (!customer_id || !package_id || !total_uses) {
      return res.status(400).json(errorResponse('缺少 customer_id , package_id , total_uses', 400));
    }
    const result = await memberPackageService.purchasePackage(
      customer_id,
      package_id,
      purchase_date,
      expiry_date,
      total_uses,
      tenantId
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
    const tenantId = (req as any).tenant_id;
    const customer_id = parseInt(req.query.customer_id as string);
    if (isNaN(customer_id)) {
      return res.status(400).json(errorResponse('無效的 customer_id', 400));
    }
    const packages = await memberPackageService.getCustomerPackages(customer_id, tenantId);
    res.json(successResponse(packages));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 客戶查詢自己的組合包（從 JWT 取得 customer_id）—— 不需 tenant
export const getMyPackages = async (req: Request, res: Response) => {
  try {
    const customer_id = (req as any).user?.id;
    if (!customer_id) return res.status(401).json(errorResponse('未授權', 401));
    const packages = await memberPackageService.getCustomerPackages(customer_id);
    res.json(successResponse(packages));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 客戶查詢已用完的組合包 —— 不需 tenant
export const getMyUsedPackages = async (req: Request, res: Response) => {
  try {
    const customer_id = (req as any).user?.id;
    if (!customer_id) return res.status(401).json(errorResponse('未授權', 401));
    const packages = await memberPackageService.getCustomerUsedPackages(customer_id);
    res.json(successResponse(packages));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 取得單一組合包詳細（管理員用）
export const getMemberPackageDetail = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const id = getParamId(req.params.id);
    const detail = await memberPackageService.getMemberPackageDetail(id, tenantId);
    if (!detail) return res.status(404).json(errorResponse('組合包不存在', 404));
    res.json(successResponse(detail));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 扣次使用服務（管理員）
export const useService = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { member_package_id, selected_service_ids, notes, signature_url, staff_id, gifts } = req.body;
    if (!member_package_id || !selected_service_ids || !selected_service_ids.length) {
      return res.status(400).json(errorResponse('缺少必要欄位', 400));
    }

    let finalSignatureUrl: string | undefined = signature_url;
    if (signature_url?.startsWith('data:image')) {
      const matches = signature_url.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
      if (matches) {
        const ext = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const fakeFile = { buffer, originalname: `package-signature.${ext}`, mimetype: `image/${ext}` } as Express.Multer.File;
        try {
          finalSignatureUrl = await SignatureService.upload(fakeFile);
        } catch (uploadErr) {
          console.error('簽名上傳失敗', uploadErr);
          throw new Error('簽名上傳失敗');
        }
      }
    }

    const created_by = (req as any).user?.id;
    const usage = await memberPackageService.useService({
      member_package_id,
      selected_service_ids,
      notes,
      signature_url: finalSignatureUrl,
      staff_id,
      created_by,
      gifts: gifts || [],
    }, tenantId);

    res.json(successResponse(usage));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '扣次失敗', 500));
  }
};

// 查詢使用紀錄（管理員）
export const getUsageLogs = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { customer_id, member_package_id } = req.query;
    const logs = await memberPackageService.getUsageLogs({
      customer_id: customer_id ? parseInt(customer_id as string) : undefined,
      member_package_id: member_package_id as string,
    }, tenantId);
    res.json(successResponse(logs));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 客戶查詢自己的使用紀錄
export const getMyUsageLogs = async (req: Request, res: Response) => {
  try {
    const customer_id = (req as any).user?.id;
    if (!customer_id) return res.status(401).json(errorResponse('未授權', 401));
    const result = await serviceLogService.getUnifiedList({ customer_id, page: 1, limit: 100 });
    res.json(successResponse(result.items || []));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '查詢失敗', 500));
  }
};

// 贈品
export const getGifts = async (req: Request, res: Response) => {
  try {
    const gifts = await memberPackageService.getGifts(req.query.member_package_id as string);
    res.json(successResponse(gifts));
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

export const getAllGifts = async (req: Request, res: Response) => {
  try {
    const gifts = await memberPackageService.getAllGifts({
      member_package_id: req.query.member_package_id as string,
      is_redeemed: req.query.is_redeemed === 'true' ? true : req.query.is_redeemed === 'false' ? false : undefined,
    });
    res.json(successResponse(gifts));
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

export const createGift = async (req: Request, res: Response) => {
  try {
    const gift = await memberPackageService.createGift(req.body);
    res.status(201).json(successResponse(gift));
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

export const updateGift = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const gift = await memberPackageService.updateGift(id, req.body);
    res.json(successResponse(gift));
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

export const deleteGift = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    await memberPackageService.deleteGift(id);
    res.status(204).send();
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

export const redeemGift = async (req: Request, res: Response) => {
  try {
    const gift = await memberPackageService.redeemGift(getParamId(req.params.id));
    res.json(successResponse(gift));
  } catch (err: any) { res.status(500).json(errorResponse(err.message)); }
};

// 人工調整剩餘次數
export const adjustRemaining = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant_id;
    const { member_package_id, delta, reason, notes } = req.body;
    if (!member_package_id || delta === undefined) {
      return res.status(400).json(errorResponse('缺少必要欄位', 400));
    }
    const result = await memberPackageService.adjustRemaining({
      member_package_id,
      delta,
      reason,
      notes,
      created_by: (req as any).user?.id,
    }, tenantId);
    res.json(successResponse(result));
  } catch (err: any) {
    console.error(err);
    res.status(500).json(errorResponse(err.message || '調整失敗', 500));
  }
};