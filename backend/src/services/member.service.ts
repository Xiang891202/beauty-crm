import * as memberRepo from '../repositories/member.repo';
import bcrypt from 'bcrypt';

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
  //傳入密碼 做 哈希處理
  if (data.password) {
    const saltRounds = 10;
    data.password_hash = await bcrypt.hash(data.password, saltRounds);
    delete data.password; // 刪除原始密碼字段
  }
  return await memberRepo.createMember(data);
};

export const modifyMember = async (id: number, data: any) => {
  // 呼叫 memberRepo.updateMember(id, data)
  //如果有更新密碼 做 哈希處理
  if (data.password) {
    const saltRounds = 10;
    data.password_hash = await bcrypt.hash(data.password, saltRounds);
    delete data.password; // 刪除原始密碼字段
  }
  return await memberRepo.updateMember(id, data);
};

export const removeMember = async (id: number) => {
  // 呼叫 memberRepo.deleteMember(id)
  return await memberRepo.deleteMember(id);
};