// src/services/adjustment.service.ts
import { AdjustmentRepository } from '../repositories/adjustment.repo';
import { Adjustment } from '../types';

export class AdjustmentService {
  private repo: AdjustmentRepository;

  constructor() {
    this.repo = new AdjustmentRepository();
  }

  async createAdjustment(data: Omit<Adjustment, 'id' | 'createdAt'>): Promise<Adjustment> {
    // 1. 业务校验：如果关联usageId，检查该记录是否存在
    // 2. 根据type和quantity更新相关库存或统计
    // 3. 创建修正记录
    return this.repo.create(data);
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
    return this.repo.findAll(filter);
  }
}