import { Request, Response } from 'express';
import * as servicePackageService from '../services/service-package.service';
import { handleError } from '../utils/response';

// 輔助函數：確保 id 為 string
const getParamId = (param: string | string[]): string => {
  if (Array.isArray(param)) return param[0];
  return param;
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration_days, items } = req.body;
    const newPackage = await servicePackageService.createPackage({
      name,
      description,
      price,
      duration_days,
      items,
    });
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const { is_active, include_deleted } = req.query;
    const packages = await servicePackageService.getPackages({
      is_active: is_active === 'true' ? true : undefined,
      include_deleted: include_deleted === 'true',
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);  // ✅ 修正
    const pkg = await servicePackageService.getPackageById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);  // ✅ 修正
    const updated = await servicePackageService.updatePackage(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);  // ✅ 修正
    await servicePackageService.deletePackage(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

export const restorePackage = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    await servicePackageService.restorePackage(id);
    res.json({ success: true, message: '已恢復' });
  } catch (error) {
    handleError(res, error);
  }
};