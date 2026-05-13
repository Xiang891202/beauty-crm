import { Service } from '../types';
import * as serviceRepo from '../repositories/service.repo';

export const getServices = async (includeDeleted = false, tenantId?: number): Promise<Service[]> => {
  if (includeDeleted) {
    return await serviceRepo.findAllIncludeDeleted(tenantId);
  }
  return await serviceRepo.findAll(tenantId);
};

export const getServiceById = async (id: number, includeDeleted = false, tenantId?: number): Promise<Service | null> => {
  return await serviceRepo.findById(id, includeDeleted, tenantId);
};

export const createService = async (data: any, tenantId?: number): Promise<Service> => {
  const newData = {
    ...data,
    duration_minutes: data.duration_minutes ?? 60,
    image_url: data.image_url ?? null,
  };
  return await serviceRepo.create(newData, tenantId);
};

export const updateService = async (id: number, data: any, tenantId?: number): Promise<Service> => {
  return await serviceRepo.update(id, data, tenantId);
};

export const deleteService = async (id: number, tenantId?: number): Promise<boolean> => {
  return await serviceRepo.softDelete(id, tenantId);
};

export const restoreService = async (id: number, tenantId?: number): Promise<boolean> => {
  return await serviceRepo.restore(id, tenantId);
};

export const permanentlyDeleteService = async (id: number, tenantId?: number): Promise<boolean> => {
  return await serviceRepo.hardDelete(id, tenantId);
};