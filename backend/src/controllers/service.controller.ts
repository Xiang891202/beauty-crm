import { Request, Response } from 'express';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import * as serviceService from '../services/service.service';
import { successResponse, errorResponse } from '../utils/response';
import { uploadImage, deleteImage } from '../utils/upload';

// 輔助函數：安全取得數字 ID
const getNumberId = (id: any): number => {
  const parsed = parseInt(String(id), 10);
  if (isNaN(parsed)) throw new Error('Invalid ID');
  return parsed;
};

// 前台取得所有未刪除服務
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceService.getServices();
    res.json(successResponse(services));
  } catch (error) {
    console.error('Error in getServices:', error);
    res.status(500).json(errorResponse('Failed to fetch services', 500));
  }
};

// 管理員取得所有服務（含已刪除）
export const getAllServicesAdmin = async (req: Request, res: Response) => {
  try {
    const services = await serviceService.getServices(true);
    res.json(successResponse(services));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch services', 500));
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const service = await serviceService.getServiceById(id);
    if (!service) {
      return res.status(404).json(errorResponse('Service not found', 404));
    }
    res.json(successResponse(service));
  } catch (error) {
    console.error('Error in getServiceById:', error);
    res.status(500).json(errorResponse('Failed to fetch service', 500));
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const validated = await createServiceSchema.validateAsync(req.body);
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file, 'services');
    }

    const serviceData = {
      ...validated,
      image_url: imageUrl,
    };

    const service = await serviceService.createService(serviceData);
    res.status(201).json(successResponse(service));
  } catch (error) {
    console.error('Error in createService:', error);
    res.status(500).json(errorResponse('Failed to create service', 500));
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const existing = await serviceService.getServiceById(id);
    if (!existing) {
      return res.status(404).json(errorResponse('Service not found', 404));
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      if (existing.image_url) {
        await deleteImage(existing.image_url);
      }
      imageUrl = await uploadImage(req.file, 'services');
    }

    const validated = await updateServiceSchema.validateAsync(req.body);
    const updateData = { ...validated, image_url: imageUrl };
    const updated = await serviceService.updateService(id, updateData);
    res.json(successResponse(updated));
  } catch (error) {
    console.error('完整錯誤:', error);
    res.status(500).json(errorResponse('Failed to update service', 500));
  }
};

// 軟刪除
export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await serviceService.deleteService(id);
    if (!success) {
      return res.status(404).json(errorResponse('Service not found', 404));
    }
    res.json(successResponse({ message: 'Service soft deleted' }));
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(500).json(errorResponse('Failed to delete service', 500));
  }
};

// 恢復
export const restoreService = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await serviceService.restoreService(id);
    if (!success) {
      return res.status(404).json(errorResponse('Service not found or not deleted', 404));
    }
    res.json(successResponse({ message: 'Service restored' }));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to restore service', 500));
  }
};

// 永久刪除
export const hardDeleteService = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await serviceService.permanentlyDeleteService(id);
    if (!success) {
      return res.status(404).json(errorResponse('Service not found', 404));
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json(errorResponse('Failed to permanently delete service', 500));
  }
};