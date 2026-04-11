import * as memberRepo from '../repositories/member.repo';
import bcrypt from 'bcrypt';

// 取得所有會員（後台專用，不含 notes/password_hash）
export const getAllMembersForAdmin = async () => {
  return await memberRepo.getMembersForAdmin();
};

// 保留原有 getAllMembers 供其他可能用途（仍返回完整欄位）
export const getAllMembers = async () => {
  return await memberRepo.getMembers();
};

export const getMember = async (id: number) => {
  return await memberRepo.getMemberById(id);
};

export const addMember = async (data: any) => {
  if (data.password) {
    const saltRounds = 10;
    data.password_hash = await bcrypt.hash(data.password, saltRounds);
    delete data.password;
  }
  return await memberRepo.createMember(data);
};

export const modifyMember = async (id: number, data: any) => {
  // 檢查電話是否已被其他會員使用
  if (data.phone) {
    const existing = await memberRepo.getMemberByPhone(data.phone);
    if (existing && existing.id !== id) {
      throw new Error('此電話號碼已被其他會員使用');
    }
  }

  if (data.password) {
    const saltRounds = 10;
    data.password_hash = await bcrypt.hash(data.password, saltRounds);
    delete data.password;
  }
  return await memberRepo.updateMember(id, data);
};

export const removeMember = async (id: number) => {
  return await memberRepo.deleteMember(id);
};