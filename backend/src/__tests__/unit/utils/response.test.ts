// src/__tests__/unit/utils/response.test.ts
import { successResponse, errorResponse } from '@/utils/response';

describe('Response Helpers', () => {
  it('successResponse 應回傳正確格式', () => {
    const data = { id: 1 };
    const result = successResponse(data);
    expect(result).toEqual({ success: true, data });
  });

  it('errorResponse 應回傳包含錯誤訊息與狀態碼', () => {
    const result = errorResponse('發生錯誤', 400);
    expect(result).toEqual({
      success: false,
      error: '發生錯誤',
      status: 400,
    });
  });
});