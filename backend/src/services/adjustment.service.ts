// src/services/adjustment.service.ts
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { AdjustmentRepository } from '../repositories/adjustment.repo';
import { Adjustment } from '../types';
import { supabase } from '../lib/supabase';

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

  async list(params: {
    customer_name?: string; // ✅ 新增
    member_service_id?: number;
    member_package_id?: string;
    adjustment_type?: 'INCREASE' | 'DECREASE';
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    const { customer_name, member_service_id, member_package_id, adjustment_type, endDate, page, limit } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('adjustments')
      .select(`
        *,
        customer:customers ( name )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (member_service_id) query = query.eq('member_service_id', member_service_id);
    if (member_package_id) query = query.eq('member_package_id', member_package_id);
    if (adjustment_type) query = query.eq('adjustment_type', adjustment_type);
    if (endDate) query = query.lte('created_at', endDate.toISOString());

    // 預設不篩選 member_service_id 或 member_package_id，讓兩者都出現
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      items: data || [],
      total: count || 0,
      page,
      limit,
    };
  }
}