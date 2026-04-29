import request from 'supertest';
import app from '@/app';
import jwt from 'jsonwebtoken';

// 直接 mock 整個 member service，避免存取真實 prisma
jest.mock('@/services/member.service', () => ({
  addMember: jest.fn(),
  getAllMembersForAdmin: jest.fn(),
  getMember: jest.fn(),
  modifyMember: jest.fn(),
  removeMember: jest.fn(),
}));

import * as memberService from '@/services/member.service';

const mockGetAllMembersForAdmin = memberService.getAllMembersForAdmin as jest.Mock;
const mockAddMember = memberService.addMember as jest.Mock;

describe('Member Routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/members (admin only)', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/members')
        .send({ name: 'test', phone: '0912345678', password: 'pass123' });
      expect(res.status).toBe(401);
    });

    it('should return 403 with staff token', async () => {
      const token = jwt.sign({ id: 1, role: 'staff' }, 'test-secret');
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'test', phone: '0912345678', password: 'pass123' });
      expect(res.status).toBe(403);
    });

    it('should create member with admin token', async () => {
      mockAddMember.mockResolvedValue({
        id: 1,
        name: 'test',
        phone: '0912345678',
      });

      const token = jwt.sign({ id: 1, role: 'admin' }, 'test-secret');
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'test', phone: '0912345678', password: 'pass123' });

      // controller 回傳 status(201).json(successResponse(member))
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 1);
    });
  });

  describe('GET /api/members (public)', () => {
    it('should return member list (wrapped in successResponse)', async () => {
      mockGetAllMembersForAdmin.mockResolvedValue([
        { id: 1, name: 'A', phone: '0912' },
      ]);
      const res = await request(app).get('/api/members');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('name', 'A');
    });
  });
});