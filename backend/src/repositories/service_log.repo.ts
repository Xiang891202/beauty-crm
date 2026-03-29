import { custom } from 'joi';
import prisma from '../config/prisma';
import { ServiceLog } from '../types';

export class ServiceLogRepository {
  async create(data: Omit<ServiceLog, 'id' | 'created_at'>): Promise<ServiceLog> {
    if (!data.customer_id) throw new Error('customer_id is required');
    if (!data.member_service_id) throw new Error('member_service_id is required');

    return await prisma.serviceLog.create({
      data: {
        customer_id: data.customer_id,
        member_service_id: data.member_service_id,
        service_id: data.service_id ?? undefined,
        used_at: data.used_at ?? undefined,   // 如果传入 null，则 undefined，数据库使用默认值 NOW()
        notes: data.notes ?? undefined,
        signature_url: data.signature_url ?? undefined,
        created_by: data.created_by ?? undefined,
      },
    });
  }

  async findById(id: number): Promise<ServiceLog | null> {
    return await prisma.serviceLog.findUnique({ where: { id } });
  }

  async findAll(filter: {
  customer_id?: number;
  service_id?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  }): Promise<{ items: ServiceLog[]; total: number }> {
    const { customer_id, service_id, startDate, endDate, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: {
      customer_id?: number;
      service_id?: number;
      used_at?: { gte?: Date; lte?: Date };
    } = {};

    if (customer_id !== undefined) where.customer_id = customer_id;
    if (service_id !== undefined) where.service_id = service_id;
    if (startDate || endDate) {
      where.used_at = {};
      if (startDate) where.used_at.gte = startDate;
      if (endDate) where.used_at.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.serviceLog.findMany({ 
        where, 
        skip, 
        take: 
        limit, 
        orderBy: { used_at: 'desc' },
        include: {
          customer: true,
          service: true,
          member_service: {
            include: { service: true }
          },
          users: true,
        },
      }),
      prisma.serviceLog.count({ where }),
    ]);

    return { items, total };
  }

    async update(id: number, data: Partial<Pick<ServiceLog, 'notes' | 'signature_url'>>): Promise<ServiceLog> {
    const updateData: { notes?: string; signature_url?: string } = {};
    if (data.notes !== undefined) updateData.notes = data.notes ?? undefined;  // 允许设置为 null 来清空备注
    if (data.signature_url !== undefined) updateData.signature_url = data.signature_url ?? undefined;  // 允许设置为 null 来清空签名URL
    return await prisma.serviceLog.update({
      where: { id },
      data: updateData,
    });
  }
}