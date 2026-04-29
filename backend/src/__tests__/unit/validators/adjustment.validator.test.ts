import { createAdjustmentSchema } from '@/validators/adjustment.validator';

describe('createAdjustmentSchema', () => {
  it('INCREASE 合法資料通過', () => {
    const data = {
      member_service_id: 10,
      adjustment_type: 'INCREASE',
      amount: 2,
      reason: '客訴補償',
    };
    const { error } = createAdjustmentSchema.validate(data);
    expect(error).toBeUndefined();
  });

  it('至少要有一個 customer_id 或 member_service_id', () => {
    const data = {
      adjustment_type: 'INCREASE',
      amount: 2,
      reason: '測試',
    };
    const { error } = createAdjustmentSchema.validate(data);
    // 根據 xor，兩者都沒有應失敗，或至少其中一個存在
    expect(error).toBeDefined();
  });

  it('amount 為 0 應失敗', () => {
    const data = {
      member_service_id: 1,
      adjustment_type: 'INCREASE',
      amount: 0,
      reason: '測試',
    };
    const { error } = createAdjustmentSchema.validate(data);
    expect(error).toBeDefined();
  });

  it('adjustment_type 類型錯誤應失敗', () => {
    const data = {
      member_service_id: 1,
      adjustment_type: 'ADD',
      amount: 1,
      reason: '測試',
    };
    const { error } = createAdjustmentSchema.validate(data);
    expect(error).toBeDefined();
  });
});