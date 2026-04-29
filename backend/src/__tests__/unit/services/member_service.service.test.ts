import * as msService from '@/services/member_service.service';
import * as repo from '@/repositories/member_service.repo';

jest.mock('@/repositories/member_service.repo');

describe('member_service.service', () => {
  it('createMemberService 成功', async () => {
    (repo.create as jest.Mock).mockResolvedValue({ id: 1, customer_id: 1, service_id: 2, total_sessions: 5 });
    const result = await msService.createMemberService({ customer_id: 1, service_id: 2, total_sessions: 5 });
    expect(result.total_sessions).toBe(5);
  });

  it('getMemberServiceById 找不到拋錯', async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(msService.getMemberServiceById(999)).rejects.toThrow('服務配額不存在');
  });
});