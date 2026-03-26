// src/repositories/adjustment.repo.ts
import { prisma } from '../lib/prisma';
import { Adjustment } from '../types';

export class AdjustmentRepository {
  async create(data: Omit<Adjustment, 'id' | 'created_at'>): Promise<Adjustment> {
    const { customer_id, member_service_id, adjustment_type, amount, reason, created_by } = data
  return await prisma.adjustments.create({
    data: {
      ...data,
      adjustment_type: data.adjustment_type as string | null, // 关键断言
      amount,
      reason,
      created_by,
    },
  });
    //模擬返回
    // return {
    //     id: 1,
    //     ...data,
    //     createdAt: new Date(),
    //     // updatedAt: new Date(),
    // };
    // throw new Error('Not implemented');
  }

  async findById(id: number): Promise<Adjustment | null> {
    // TODO: 查询单条
    return await prisma.adjustments.findUnique({ where: { id }});
    //模擬存在數據
    // if (id === 1) {
    //     return {
    //         id: 1,
    //         usageId: 1,
    //         type: 'INCREASE',
    //         quantity: 2,
    //         reason: 'Test reason',
    //         notes: 'Test notes',
    //         createdBy: 1,
    //         createdAt: new Date(),
    //         // updatedAt: new Date(),
    //     };
    // }
    // // throw new Error('Not implemented');
    // return null;
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
    // TODO: 分页条件查询
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
      prisma.adjustments.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.adjustments.count({ where }),
    ]);

    return { items, total };
  }
    //模擬列表
    // return {
    //   items: [
    //     {
    //       id: 1,
    //       usageId: 1,
    //       type: 'INCREASE',
    //       quantity: 2,
    //       reason: 'Test reason',
    //       notes: 'Test notes',
    //       createdBy: 1,
    //       createdAt: new Date(),
    //     //   updatedAt: new Date(),
    //     },
    //   ],
    //   total: 1,
    // };
    // throw new Error('Not implemented');
}