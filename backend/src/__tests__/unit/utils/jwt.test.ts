// src/__tests__/unit/utils/jwt.test.ts
import jwt from 'jsonwebtoken';

// 直接測試 jwt 庫的行為（你的 utils/jwt 封裝了 jsonwebtoken）
describe('JWT Utilities', () => {
  const payload = { id: 1, role: 'admin' };
  const secret = 'test-secret';

  it('應能生成 token 並且可以驗證解出 payload', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret) as any;
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('admin');
  });

  it('過期的 token 應拋出 TokenExpiredError', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1ms' });
    // 等待過期
    return new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
      expect(() => jwt.verify(token, secret)).toThrow(jwt.TokenExpiredError);
    });
  });

  it('用錯誤的 secret 驗證應拋錯', () => {
    const token = jwt.sign(payload, secret);
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow(jwt.JsonWebTokenError);
  });
});