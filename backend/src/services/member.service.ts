import * as memberRepo from '../repositories/member.repo';

export const getAllMembers = async () => {
  // 呼叫 memberRepo.getMembers()
  return await memberRepo.getMembers();
};

export const getMember = async (id: number) => {
  // 呼叫 memberRepo.getMemberById(id)
  return await memberRepo.getMemberById(id);
};

export const addMember = async (data: any) => {
  // 呼叫 memberRepo.createMember(data)
  return await memberRepo.createMember(data);
};

export const modifyMember = async (id: number, data: any) => {
  // 呼叫 memberRepo.updateMember(id, data)
  return await memberRepo.updateMember(id, data);
};

export const removeMember = async (id: number) => {
  // 呼叫 memberRepo.deleteMember(id)
  return await memberRepo.deleteMember(id);
};