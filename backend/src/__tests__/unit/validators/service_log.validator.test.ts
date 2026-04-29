import { createUsageSchema } from '@/validators/service_log.validator';
// 也可以測試 updateUsageNotesSchema 和 listUsagesQuerySchema

describe('createUsageSchema', () => {
  it('合法資料通過', () => {
    const data = {
      member_service_id: 10,
      customer_id: 1,
      service_id: 2,
      used_at: new Date().toISOString(),
      notes: 'test',
      signature_url: 'url',
    };
    const { error } = createUsageSchema.validate(data);
    expect(error).toBeUndefined();
  });

  it('缺少必填 member_service_id 應失敗', () => {
    const data = { customer_id: 1 };
    const { error } = createUsageSchema.validate(data);
    expect(error).toBeDefined();
  });

  it('customer_id 為字串應失敗', () => {
    const data = { member_service_id: 1, customer_id: 'abc' };
    const { error } = createUsageSchema.validate(data);
    expect(error).toBeDefined();
  });
});