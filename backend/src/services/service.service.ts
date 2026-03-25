import { Service } from '../types';
import * as serviceRepo from '../repositories/service.repo';

/**
 * 获取所有服务
 */
export const getServices = async (): Promise<Service[]> => {
  return await serviceRepo.findAll();
};

/**
 * 根据ID获取服务
 */
export const getServiceById = async (id: number): Promise<Service | null> => {
  return await serviceRepo.findById(id);
};

/**
 * 创建服务
 */
export const createService = async (data: any): Promise<Service> => {
  // 确保 duration_minutes 有默认值（验证器已提供 default，但这里再加一层保护）
  const newData = {
    ...data,
    duration_minutes: data.duration_minutes ?? 60,
  };
  return await serviceRepo.create(newData);
};

/**
 * 更新服务
 */
export const updateService = async (id: number, data: any): Promise<Service> => {
  return await serviceRepo.update(id, data);
};

/**
 * 删除服务
 */
export const deleteService = async (id: number): Promise<void> => {
  await serviceRepo.remove(id);
};