import * as memberServiceRepo from '../repositories/member_service.repo';

export const getAllMemberServices = async (customer_id?: number) => {
  return await memberServiceRepo.findAll(customer_id);
};

export const getMemberServiceById = async (id: number) => {
  const ms = await memberServiceRepo.findById(id);
  if (!ms) throw new Error('服務配額不存在');
  return ms;
};

export const createMemberService = async (data: {
  customer_id: number;
  service_id: number;
  total_sessions: number;
  expiry_date?: Date;
}) => {
  // 可加入業務檢查：客戶是否存在、服務是否存在等
  return await memberServiceRepo.create(data);
};

export const updateMemberService = async (id: number, data: any) => {
  return await memberServiceRepo.update(id, data);
};

export const deleteMemberService = async (id: number) => {
  return await memberServiceRepo.remove(id);
};