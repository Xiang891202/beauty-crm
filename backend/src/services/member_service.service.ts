import * as memberServiceRepo from '../repositories/member_service.repo';

export const getAllMemberServices = async (customer_id?: number, tenantId?: number) => {
  return await memberServiceRepo.findAll(customer_id, tenantId);
};

export const getMemberServiceById = async (id: number, tenantId?: number) => {
  const ms = await memberServiceRepo.findById(id, tenantId);
  if (!ms) throw new Error('服務配額不存在');
  return ms;
};

export const createMemberService = async (data: {
  customer_id: number;
  service_id: number;
  total_sessions: number;
  expiry_date?: Date;
}, tenantId?: number) => {
  return await memberServiceRepo.create(data, tenantId);
};

export const updateMemberService = async (id: number, data: any, tenantId?: number) => {
  return await memberServiceRepo.update(id, data, tenantId);
};

export const deleteMemberService = async (id: number, tenantId?: number) => {
  return await memberServiceRepo.remove(id, tenantId);
};