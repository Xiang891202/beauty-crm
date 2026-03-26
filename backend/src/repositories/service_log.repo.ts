// src/repositories/usage.repo.ts
// import { date } from 'joi';
import { prisma } from '../lib/prisma';
import { ServiceLog } from '../types';

export class ServiceLogRepository {
  // 创建使用记录
  async create(data: Omit<ServiceLog, 'id' | 'created_at'>): Promise<ServiceLog> {
  const { customer_id, service_id, used_at, notes, signature_url, created_by } = data;
  // 确保 created_by 存在
  if (!created_by) throw new Error('created_by is required');
  return await prisma.service_logs.create({
    data: {
      customer_id,
      service_id,
      used_at: used_at || new Date(),
      notes,
      signature_url,
      created_by,
    },
  });
    // //模擬返回
    // return {
    //     id: 1,
    //     ...data,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    // };
    // throw new Error('Not implemented');
  }

  // 根据ID查询
  async findById(id: number): Promise<ServiceLog | null> {
    // TODO: 查询单条记录
    return await prisma.service_logs.findUnique({ where: { id }});
    //模擬存在數據
    // if (id === 1) {
    //     return {
    //         id: 1,
    //         memberId: 1,
    //         serviceId: 1,
    //         quantity: 2,
    //         usageDate: new Date(),
    //         notes: 'Test usage',
    //         createdBy: 1,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //     };
    // }
    // // throw new Error('Not implemented');
    // return null;
  }

  // 分页查询使用记录（可按会员、服务、日期范围过滤）
  async findAll(filter: {
    customer_id?: number;
    service_id?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: ServiceLog[]; total: number }> {
    // TODO: 实现分页和条件查询
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
        prisma.service_logs.findMany({
            where,
            skip,
            take: limit,
            orderBy: { used_at: 'desc' },
        }),
        prisma.service_logs.count({ where }),
    ]);
    return { items, total };
    //模擬列表
    // return {
    //   items: [
    //     {
    //       id: 1,
    //       memberId: 1,
    //       serviceId: 1,
    //       quantity: 2,
    //       usageDate: new Date(),
    //       notes: 'Test usage',
    //       createdBy: 1,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ],
    //   total: 1,
    // };
    // throw new Error('Not implemented');
  }

  // 更新使用记录（一般只允许修改备注等非核心字段）
  async update(id: number, data: Partial<Pick<ServiceLog, 'notes' | 'signature_url'>>): Promise<ServiceLog> {
    // TODO: 实现更新
    return await prisma.service_logs.update({
        where: { id },
        data,
    });
    //模擬更新
    // return {
    //   id,
    //   memberId: 1,
    //   serviceId: 1,
    //   quantity: 2,
    //   usageDate: new Date(),
    //   notes: data.notes || 'Updated notes',
    //   createdBy: 1,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };
  }
    // throw new Error('Not implemented');
}