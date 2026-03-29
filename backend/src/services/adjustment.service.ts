// src/services/adjustment.service.ts
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { AdjustmentRepository } from '../repositories/adjustment.repo';
import { Adjustment } from '../types';

export class AdjustmentService {
  private repo: AdjustmentRepository;

  constructor() {
    this.repo = new AdjustmentRepository();
  }

  async createAdjustment(data: Omit<Adjustment, 'id' | 'created_at'>): Promise<Adjustment> {
    // 1. 校验必须字段
    if (!data.member_service_id) {
      throw new Error('member_service_id is required');
    }

    // 使用事务同时创建调整记录并更新剩余次数
    return await prisma.$transaction(async (tx) => {
      // 2. 获取当前 member_service 记录
      const memberService = await tx.memberService.findUnique({
        where: { id: data.member_service_id! }, // 已确保非空
      });
      if (!memberService) {
        throw new Error('Member service record not found');
      }

      // 3. 计算新的剩余次数
      let newRemaining = memberService.remaining_sessions;
      if (data.adjustment_type === 'INCREASE') {
        newRemaining += data.amount;
      } else if (data.adjustment_type === 'DECREASE') {
        if (memberService.remaining_sessions - data.amount < 0) {
          throw new Error('Cannot decrease below zero');
        }
        newRemaining -= data.amount;
      }

      // 4. 更新 member_services 的剩余次数
      await tx.memberService.update({
        where: { id: data.member_service_id! },
        data: { remaining_sessions: newRemaining },
      });

      // 5. 创建调整记录
      const adjustment = await tx.adjustment.create({
        data: {
          member_service_id: data.member_service_id!,
          adjustment_type: data.adjustment_type as 'INCREASE' | 'DECREASE', // 显式类型断言
          amount: data.amount,
          reason: data.reason ?? null,
          created_by: data.created_by ?? null,
        },
      });

      return adjustment;
    });
  }


  async getById(id: number): Promise<Adjustment> {
    const adj = await this.repo.findById(id);
    if (!adj) {
      throw new Error('Adjustment not found');
    }
    return adj;
  }

  async list(filter: {
  usageId?: number;
  productId?: number;
  type?: 'INCREASE' | 'DECREASE';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  }): Promise<{ items: Adjustment[]; total: number }> {
    return this.repo.findAll({
      member_service_id: filter.usageId,   // 映射
      adjustment_type: filter.type,
      startDate: filter.startDate,
      endDate: filter.endDate,
      page: filter.page,
      limit: filter.limit,
    });
  }
}