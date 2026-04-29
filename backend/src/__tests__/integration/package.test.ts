import request from 'supertest';
import app from '@/app';
import jwt from 'jsonwebtoken';

// mock 組合包 service 所有方法
jest.mock('@/services/member-package.service', () => ({
  purchasePackage: jest.fn(),
  useService: jest.fn(),
  adjustRemaining: jest.fn(),
  getCustomerPackages: jest.fn(),
  getUsageLogs: jest.fn(),
  getGifts: jest.fn(),
  getAllGifts: jest.fn(),
  createGift: jest.fn(),
  updateGift: jest.fn(),
  deleteGift: jest.fn(),
  redeemGift: jest.fn(),
}));

import * as mpService from '@/services/member-package.service';

const mockPurchase = mpService.purchasePackage as jest.Mock;
const mockUse = mpService.useService as jest.Mock;
const mockAdjust = mpService.adjustRemaining as jest.Mock;

describe('Member Package Routes', () => {
  let adminToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    adminToken = jwt.sign({ id: 1, role: 'admin' }, 'test-secret');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/member-packages/purchase', () => {
    it('should purchase package successfully', async () => {
      mockPurchase.mockResolvedValue({ id: 'mp-1', remaining_uses: 2 });

      const res = await request(app)
        .post('/api/admin/member-packages/purchase')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customer_id: 1,
          package_id: 'pkg-1',
          total_uses: 5,               // 必要欄位
        });

      // controller 直接 res.json(successResponse(result))
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('mp-1');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/member-packages/purchase')
        .send({ customer_id: 1, package_id: 'pkg-1', total_uses: 5 });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/admin/member-packages/use', () => {
    it('should use service successfully', async () => {
      mockUse.mockResolvedValue({ id: 'log-1' });

      const res = await request(app)
        .post('/api/admin/member-packages/use')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          member_package_id: 'mp-1',
          selected_service_ids: [1],
          signature_url: 'sig',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 when service throws error', async () => {
      mockUse.mockRejectedValue(new Error('剩餘次數不足'));

      const res = await request(app)
        .post('/api/admin/member-packages/use')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          member_package_id: 'mp-1',
          selected_service_ids: [1],
          signature_url: 'sig',
        });

      // controller catch 直接 res.status(500).json(...)
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/member-packages/adjust', () => {
    it('should adjust remaining uses', async () => {
      mockAdjust.mockResolvedValue({ old_remaining: 3, new_remaining: 5, delta: 2 });

      const res = await request(app)
        .post('/api/admin/member-packages/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ member_package_id: 'mp-1', delta: 2, reason: '補償' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});