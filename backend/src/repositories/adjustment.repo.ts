import prisma from '../config/prisma';
import { Adjustment } from '../types';

export class AdjustmentRepository {
  async create(data: Omit<Adjustment, 'id' | 'created_at'>): Promise<Adjustment> {
    const createData: any = {
      // customer_id: data.customer_id ?? null,
      member_service_id: data.member_service_id ?? null,
      adjustment_type: data.adjustment_type,
      amount: data.amount,
      reason: data.reason ?? null,
      created_by: data.created_by ?? null,
    };
    return await prisma.adjustment.create({ data: createData });
  }

  async findById(id: number): Promise<Adjustment | null> {
    return await prisma.adjustment.findUnique({ where: { id } });
  }

  async findAll(filter: {
    customer_id?: number;
    member_service_id?: number;
    adjustment_type?: 'INCREASE' | 'DECREASE';
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: Adjustment[]; total: number }> {
    const { customer_id, member_service_id, adjustment_type, startDate, endDate, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customer_id) where.customer_id = customer_id;
    if (member_service_id) where.member_service_id = member_service_id;
    if (adjustment_type) where.adjustment_type = adjustment_type;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.adjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.adjustment.count({ where }),
    ]);

    return { items, total };
  }
}