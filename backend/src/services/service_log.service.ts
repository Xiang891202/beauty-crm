// src/services/usage.service.ts
import { ServiceLogRepository } from '../repositories/service_log.repo';
import { ServiceLog } from '../types';

export class ServiceLogService {
  private repo: ServiceLogRepository;

  constructor() {
    this.repo = new ServiceLogRepository();
  }

  async create(data: Omit<ServiceLog, 'id' | 'created_at' >): Promise<ServiceLog> {
    // 1. 业务校验（如会员是否存在、服务是否存在、库存是否充足等）
    // 2. 调用repo创建记录
    // 3. 可能需要更新相关统计（如会员消费次数、产品库存）
    return this.repo.create(data);
  }

  async getById(id: number): Promise<ServiceLog> {
    const record = await this.repo.findById(id);
    if (!record) {
      throw new Error('Service log not found');
    }
    return record;
  }

  async list(filter: {
    customer_id?: number;
    service_id?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: ServiceLog[]; total: number }> {
    // 可添加默认分页值
    return this.repo.findAll(filter);
  }

  async updateNotes(id: number, notes: string): Promise<ServiceLog> {
    return this.repo.update(id, { notes });
  }

  async updateSignature(id: number, signatureUrl: string): Promise<ServiceLog> {
    return this.repo.update(id, { signature_url: signatureUrl });
  }
}