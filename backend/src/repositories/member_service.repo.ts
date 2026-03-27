import prisma from '../config/prisma';

export const findAll = async (customer_id?: number) => {
  const where = customer_id ? { customer_id } : {};
  return prisma.memberService.findMany({
    where,
    orderBy: { id: 'asc' },
  });
};

export const findById = async (id: number) => {
  return prisma.memberService.findUnique({
    where: { id },
  });
};

export const create = async (data: {
  customer_id: number;
  service_id: number;
  total_sessions: number;
  expiry_date?: Date;
}) => {
  return prisma.memberService.create({
    data: {
      customer_id: data.customer_id,
      service_id: data.service_id,
      total_sessions: data.total_sessions,
      remaining: data.total_sessions,
      expiry_date: data.expiry_date,
    },
  });
};

export const update = async (
  id: number,
  data: Partial<{
    total_sessions: number;
    remaining: number;
    expiry_date: Date;
  }>
) => {
  return prisma.memberService.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  await prisma.memberService.delete({ where: { id } });
  return true;
};