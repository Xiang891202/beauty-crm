import prisma from '../config/prisma';

export const findAll = async (customer_id?: number, tenantId?: number) => {
  const where: any = {};
  if (customer_id) where.customer_id = customer_id;
  if (tenantId) where.tenant_id = tenantId;
  return prisma.memberService.findMany({
    where,
    include: { service: true },
    orderBy: { id: 'asc' },
  });
};

export const findById = async (id: number, tenantId?: number) => {
  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  return prisma.memberService.findUnique({ where });
};

export const create = async (data: any, tenantId?: number) => {
  const createData: any = {
    customer_id: data.customer_id,
    service_id: data.service_id,
    total_sessions: data.total_sessions,
    remaining_sessions: data.total_sessions,
    expiry_date: data.expiry_date,
  };
  if (tenantId) createData.tenant_id = tenantId;

  return prisma.memberService.upsert({
    where: {
      customer_id_service_id: {
        customer_id: data.customer_id,
        service_id: data.service_id,
      },
    },
    update: {
      total_sessions: { increment: data.total_sessions },
      remaining_sessions: { increment: data.total_sessions },
      expiry_date: data.expiry_date ?? undefined,
    },
    create: createData,
  });
};

export const update = async (id: number, data: any, tenantId?: number) => {
  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  return prisma.memberService.update({ where, data });
};

export const remove = async (id: number, tenantId?: number) => {
  const where: any = { id };
  if (tenantId) where.tenant_id = tenantId;
  await prisma.memberService.delete({ where });
  return true;
};