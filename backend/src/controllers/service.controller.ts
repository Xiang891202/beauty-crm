import { Request, Response } from 'express';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import * as serviceService from '../services/service.service';
import { successResponse, handleError } from '../utils/response';

/**
 * 获取所有服务（支持分页/筛选，可根据需要扩展）
 */
export const getServices = async (req: Request, res: Response) => {
  try {
    // 可选：接收查询参数 page, limit, name 等
    const services = await serviceService.getServices();
    res.json(successResponse(services));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 根据ID获取单个服务
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await serviceService.getServiceById(Number(id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(successResponse(service));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 创建新服务
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const validated = await createServiceSchema.validateAsync(req.body);
    const service = await serviceService.createService(validated);
    res.status(201).json(successResponse(service));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 更新服务
 */
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = await updateServiceSchema.validateAsync(req.body);
    const service = await serviceService.updateService(Number(id), validated);
    res.json(successResponse(service));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 删除服务
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(Number(id));
    res.json(successResponse({ message: 'Service deleted successfully' }));
  } catch (error) {
    handleError(res, error);
  }
};