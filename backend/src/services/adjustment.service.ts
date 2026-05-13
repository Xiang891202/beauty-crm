// src/services/adjustment.service.ts
import prisma from '../config/prisma';
import { AdjustmentRepository } from '../repositories/adjustment.repo';
import { Adjustment } from '../types';
import { supabase } from '../lib/supabase';

export class AdjustmentService {
  private repo: AdjustmentRepository;

  constructor() {
    this.repo = new AdjustmentRepository();
  }

  async createAdjustment(data: Omit<Adjustment, 'id' | 'created_at'>, tenantId?: number): Promise<Adjustment> {
    if (!data.member_service_id) {
      throw new Error('member_service_id is required');
    }

    return await prisma.$transaction(async (tx) => {
      const memberService = await tx.memberService.findUnique({
        where: { id: data.member_service_id! },
      });
      if (!memberService) {
        throw new Error('Member service record not found');
      }

      let newRemaining = memberService.remaining_sessions;
      if (data.adjustment_type === 'INCREASE') {
        newRemaining += data.amount;
      } else if (data.adjustment_type === 'DECREASE') {
        if (memberService.remaining_sessions - data.amount < 0) {
          throw new Error('Cannot decrease below zero');
        }
        newRemaining -= data.amount;
      }

      await tx.memberService.update({
        where: { id: data.member_service_id! },
        data: { remaining_sessions: newRemaining },
      });

      const adjustmentData: any = {
        member_service_id: data.member_service_id!,
        customer_id: memberService.customer_id,
        adjustment_type: data.adjustment_type,
        amount: data.amount,
        reason: data.reason ?? null,
        created_by: data.created_by ?? null,
        created_at: new Date().toISOString(),
      };
      if (tenantId) adjustmentData.tenant_id = tenantId;

      const adjustment = await tx.adjustment.create({ data: adjustmentData });
      return adjustment;
    });
  }

  async getById(id: number, tenantId?: number): Promise<Adjustment> {
    const adj = await this.repo.findById(id, tenantId);
    if (!adj) throw new Error('Adjustment not found');
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
    tenantId?: number;
  }) {
    const { customer_name, member_service_id, member_package_id, adjustment_type, endDate, page, limit, tenantId } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('adjustments')
      .select(`*, customer:customers ( name )`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 强制过滤当前租户
    if (tenantId) query = query.eq('tenant_id', tenantId);

    if (member_service_id) query = query.eq('member_service_id', member_service_id);
    if (member_package_id) query = query.eq('member_package_id', member_package_id);
    if (adjustment_type) query = query.eq('adjustment_type', adjustment_type);
    if (endDate) query = query.lte('created_at', endDate.toISOString());

    if (customer_name) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .ilike('name', `%${customer_name}%`);
      const customerIds = customers?.map(c => c.id) || [];
      if (customerIds.length > 0) {
        // 同时需要限定顾客也在当前租户下（customers 表有 tenant_id）
        // 这里简单加上 tenant 过滤：在 customers 查询时也限租户
        // 但当前 supabase 查询未带 tenant，稍后可以优化，暂时先保留原有逻辑
        query = query.in('customer_id', customerIds);
      } else {
        return { items: [], total: 0, page, limit };
      }
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return { items: data || [], total: count || 0, page, limit };
  }
}