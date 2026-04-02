import { Service } from '../types';
import * as serviceRepo from '../repositories/service.repo';

// 取得所有服務（可選擇是否包含已刪除）
export const getServices = async (includeDeleted = false): Promise<Service[]> => {
  if (includeDeleted) {
    return await serviceRepo.findAllIncludeDeleted();
  }
  return await serviceRepo.findAll();
};

// 根據 ID 取得服務（可選擇是否包含已刪除）
export const getServiceById = async (id: number, includeDeleted = false): Promise<Service | null> => {
  return await serviceRepo.findById(id, includeDeleted);
};

// 建立服務
export const createService = async (data: any): Promise<Service> => {
  const newData = {
    ...data,
    duration_minutes: data.duration_minutes ?? 60,
    image_url: data.image_url ?? null,
  };
  return await serviceRepo.create(newData);
};

// 更新服務
export const updateService = async (id: number, data: any): Promise<Service> => {
  return await serviceRepo.update(id, data);
};

// 軟刪除
export const deleteService = async (id: number): Promise<boolean> => {
  return await serviceRepo.softDelete(id);
};

// 恢復
export const restoreService = async (id: number): Promise<boolean> => {
  return await serviceRepo.restore(id);
};

// 永久刪除
export const permanentlyDeleteService = async (id: number): Promise<boolean> => {
  return await serviceRepo.hardDelete(id);
};