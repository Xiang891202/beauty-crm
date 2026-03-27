import prisma from '../config/prisma';
import { ServiceLog } from '../types';

export class ServiceLogRepository {
  async create(data: Omit<ServiceLog, 'id' | 'created_at'>): Promise<ServiceLog> {
    // 必要欄位檢查
    if (!data.customer_id) throw new Error('customer_id is required');
    if (!data.member_service_id) throw new Error('member_service_id is required');

    const createData: any = {
      customer_id: data.customer_id,
      member_service_id: data.member_service_id,
      service_id: data.service_id ?? undefined,
      used_at: data.used_at ?? undefined,
      note: data.note ?? undefined,
      signature_url: data.signature_url ?? undefined,
    };
    // 如果 created_by 有值才加入
    if (data.created_by) {
      createData.created_by = data.created_by;
    }

    return await prisma.serviceLog.create({ data: createData });
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

    const where: any = {};
    if (customer_id) where.customer_id = customer_id;
    if (service_id) where.service_id = service_id;
    if (startDate || endDate) {
      where.used_at = {};
      if (startDate) where.used_at.gte = startDate;
      if (endDate) where.used_at.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.serviceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { used_at: 'desc' },
      }),
      prisma.serviceLog.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: number, data: Partial<Pick<ServiceLog, 'note' | 'signature_url'>>): Promise<ServiceLog> {
    const updateData: any = {};
    if (data.note !== undefined) updateData.note = data.note;
    if (data.signature_url !== undefined) updateData.signature_url = data.signature_url;
    return await prisma.serviceLog.update({
      where: { id },
      data: updateData,
    });
  }
}