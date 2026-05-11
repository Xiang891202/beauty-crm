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
      // 修改 createAdjustment 事务中的 adjustment create 部分
      // 修改后：强制传入 UTC 时间
      const utcNow = new Date().toISOString();
      const adjustment = await tx.adjustment.create({
        data: {
          member_service_id: data.member_service_id!,
          customer_id: memberService.customer_id,
          adjustment_type: data.adjustment_type as 'INCREASE' | 'DECREASE',
          amount: data.amount,
          reason: data.reason ?? null,
          created_by: data.created_by ?? null,
          created_at: new Date().toISOString(), // 显式添加UTC时间
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
    customer_name?: string;
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

    // 客戶姓名篩選：需要先查符合姓名的客戶 ID
    if (customer_name) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .ilike('name', `%${customer_name}%`);
      const customerIds = customers?.map(c => c.id) || [];
      if (customerIds.length > 0) {
        query = query.in('customer_id', customerIds);
      } else {
        return { items: [], total: 0, page, limit };
      }
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    // 將每筆記錄的 created_at 轉為台灣時間字串
    // const items = (data || []).map(adj => ({
    //   ...adj,
    //   created_at: adj.created_at
    //     ? new Date(adj.created_at).toLocaleString('zh-TW', {
    //         timeZone: 'Asia/Taipei',
    //         hour12: false,
    //       })
    //     : null,
    // }));

    return {
      items: data || [],
      total: count || 0,
      page,
      limit,
    };
  }
}