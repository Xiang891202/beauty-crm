import { ServiceLogService } from '../service_log.service';
import { ServiceLogRepository } from '../../repositories/service_log.repo';
import prisma from '../../config/prisma';
import { InsufficientQuotaError } from '../../types/errors';

jest.mock('../../repositories/service_log.repo');
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    memberService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    serviceLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('ServiceLogService', () => {
  let service: ServiceLogService;
  let mockRepo: jest.Mocked<ServiceLogRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ServiceLogService();
    mockRepo = new ServiceLogRepository() as jest.Mocked<ServiceLogRepository>;
    (service as any).repo = mockRepo;
  });

  describe('create', () => {
    it('应该在没有 member_service_id 时直接调用 repository 的 create', async () => {
      // 修正：添加 member_service_id: null（符合类型要求）
      const data = {
        customer_id: 1,
        member_service_id: null,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      const expected = { id: 1, ...data };
      mockRepo.create.mockResolvedValue(expected as any);

      const result = await service.create(data);

      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(expected);
      expect(prisma.memberService.findUnique).not.toHaveBeenCalled();
    });

    it('应该在有 member_service_id 且剩余次数足够时扣减并建立记录', async () => {
      const data = {
        customer_id: 1,
        member_service_id: 10,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      const memberServiceMock = { remaining_sessions: 5 };
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue(memberServiceMock);

      const newLog = { id: 1, ...data };
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          serviceLog: { create: jest.fn().mockResolvedValue(newLog) },
          memberService: { update: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.create(data);

      expect(prisma.memberService.findUnique).toHaveBeenCalledWith({
        where: { id: data.member_service_id },
        select: { remaining_sessions: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(newLog);
    });

    it('应该在 member_service_id 对应的授权不存在时抛出错误', async () => {
      const data = {
        customer_id: 1,
        member_service_id: 10,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(data)).rejects.toThrow('找不到該服務授權');
    });

    it('应该在剩余次数不足时抛出 InsufficientQuotaError', async () => {
      const data = {
        customer_id: 1,
        member_service_id: 10,
        service_id: 2,
        used_at: new Date(),
        notes: 'test',
        signature_url: 'url',
        created_by: 1,
      };
      const memberServiceMock = { remaining_sessions: 0 };
      (prisma.memberService.findUnique as jest.Mock).mockResolvedValue(memberServiceMock);

      await expect(service.create(data)).rejects.toThrow(InsufficientQuotaError);
    });
  });

  describe('getById', () => {
    it('应该返回存在的记录', async () => {
      const log = { id: 1, customer_id: 1, notes: 'test' };
      mockRepo.findById.mockResolvedValue(log as any);

      const result = await service.getById(1);
      expect(result).toEqual(log);
    });

    it('应该在记录不存在时抛出错误', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow('Service log not found');
    });
  });

  describe('list', () => {
    it('应该调用 repository.findAll 并返回结果', async () => {
      const filter = { customer_id: 1, page: 1, limit: 10 };
      const expected = { items: [], total: 0 };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await service.list(filter);
      expect(mockRepo.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expected);
    });
  });

  describe('updateNotes', () => {
    it('应该调用 repository.update 更新 notes', async () => {
      const id = 1;
      const notes = 'new notes';
      const updated = { id, notes } as any;
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.updateNotes(id, notes);
      expect(mockRepo.update).toHaveBeenCalledWith(id, { notes: notes });
      expect(result).toEqual(updated);
    });
  });

  describe('updateSignature', () => {
    it('应该调用 repository.update 更新 signature_url', async () => {
      const id = 1;
      const signatureUrl = 'http://example.com/sig.png';
      const updated = { id, signature_url: signatureUrl } as any;
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.updateSignature(id, signatureUrl);
      expect(mockRepo.update).toHaveBeenCalledWith(id, { signature_url: signatureUrl });
      expect(result).toEqual(updated);
    });
  });
});