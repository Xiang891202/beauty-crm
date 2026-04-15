import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

// 取得所有會員（後台專用，不含密碼）
export const getAllMembersForAdmin = async () => {
  return await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      birthday: true,
      address: true,
      notes: true,
      created_at: true,
      updated_at: true,
    },
  });
};

// 取得所有會員（完整，含密碼，僅內部使用）
export const getAllMembers = async () => {
  return await prisma.customer.findMany();
};

// 取得單一會員
export const getMember = async (id: number) => {
  return await prisma.customer.findUnique({ where: { id } });
};

// 新增會員
export const addMember = async (data: any) => {
  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return await prisma.customer.create({ data });
};

// 修改會員
export const modifyMember = async (id: number, data: any) => {
  // 檢查電話是否已被其他會員使用
  if (data.phone) {
    const existing = await prisma.customer.findFirst({
      where: { phone: data.phone, NOT: { id } },
    });
    if (existing) throw new Error('此電話號碼已被其他會員使用');
  }

  // 處理密碼
  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  // 處理生日：將字串轉為 Date 物件
  if (data.birthday) {
    data.birthday = new Date(data.birthday);
  }

  // 更新資料（只更新傳入的欄位）
  return await prisma.customer.update({
    where: { id },
    data,
  });
};

// 刪除會員
export const removeMember = async (id: number) => {
  await prisma.customer.delete({ where: { id } });
  return true;
};