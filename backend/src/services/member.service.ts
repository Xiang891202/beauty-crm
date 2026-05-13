import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

// 取得所有會員（後台專用，不含密碼） —— 加上 tenant 過濾
export const getAllMembersForAdmin = async (tenantId: number) => {
  return await prisma.customer.findMany({
    where: { tenant_id: tenantId },
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

// 取得所有會員（完整，含密碼，僅內部使用） —— 也可選擇加上 tenant 過濾，或保留原樣
export const getAllMembers = async (tenantId?: number) => {
  return await prisma.customer.findMany({
    where: tenantId ? { tenant_id: tenantId } : {},
  });
};

// 取得單一會員 —— 加上 tenant 檢查（可選，但建議加上）
export const getMember = async (id: number, tenantId?: number) => {
  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  return await prisma.customer.findUnique({ where });
};

// 新增會員 —— 強制注入 tenant_id
export const addMember = async (data: any, tenantId: number) => {
  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  if (data.birthday) {
    data.birthday = new Date(data.birthday + 'T00:00:00.000Z');
  }
  return await prisma.customer.create({
    data: { ...data, tenant_id: tenantId },
  });
};

// 修改會員 —— 保持原有邏輯，只需確保查詢限於當前 tenant（可選）
export const modifyMember = async (id: number, data: any, tenantId?: number) => {
  if (data.phone) {
    const existing = await prisma.customer.findFirst({
      where: { phone: data.phone, NOT: { id }, tenant_id: tenantId },
    });
    if (existing) throw new Error('此電話號碼已被其他會員使用');
  }

  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  if (data.birthday) {
    data.birthday = new Date(data.birthday);
  }

  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  return await prisma.customer.update({
    where,
    data,
  });
};

// 刪除會員 —— 可選加上 tenant 檢查
export const removeMember = async (id: number, tenantId?: number) => {
  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  await prisma.customer.delete({ where });
  return true;
};