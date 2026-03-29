import prisma from '../config/prisma';
import { ServiceLogRepository } from '../repositories/service_log.repo';
import { ServiceLog } from '../types';
import { InsufficientQuotaError } from '../types/errors';

export class ServiceLogService {
  private repo: ServiceLogRepository;

  constructor() {
    this.repo = new ServiceLogRepository();
  }

  async create(data: Omit<ServiceLog, 'id' | 'created_at'>): Promise<ServiceLog> {
    if (!data.member_service_id) {
      return this.repo.create(data);
    }

    const memberService = await prisma.memberService.findUnique({
      where: { id: data.member_service_id },
      select: { remaining_sessions: true }
    });

    if (!memberService) {
      throw new Error('找不到該服務授權');
    }

    if (memberService.remaining_sessions <= 0) {
      throw new InsufficientQuotaError();
    }

    const result = await prisma.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          customer_id: data.customer_id!,
          member_service_id: data.member_service_id!,
          service_id: data.service_id ?? undefined,
          used_at: data.used_at ?? undefined,
          notes: data.notes ?? undefined,          // ✅ 改為 note
          signature_url: data.signature_url ?? undefined,
          created_by: data.created_by!,
        }
      });

      await tx.memberService.update({
        where: { id: data.member_service_id! },
        data: { remaining_sessions: { decrement: 1 } }
      });

      return newLog;
    });

    return result;
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
    return this.repo.findAll(filter);
  }

  async updateNotes(id: number, notes: string): Promise<ServiceLog> {
    return this.repo.update(id, { notes: notes });  // ✅ 改為 note
  }

  async updateSignature(id: number, signatureUrl: string): Promise<ServiceLog> {
    return this.repo.update(id, { signature_url: signatureUrl });
  }
}