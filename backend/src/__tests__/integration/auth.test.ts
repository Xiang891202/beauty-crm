import request from 'supertest';
import app from '@/app';
import jwt from 'jsonwebtoken';

describe('Auth Routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/auth/login', () => {
    it('should return token with hardcoded credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@gmail.com', password: '123456' });

      // 硬編碼帳號成功回傳 200
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@gmail.com');
    });

    it('should return 401 on wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const token = jwt.sign(
        { id: 99, email: 'admin@test.com', role: 'admin' },
        'test-secret'
      );
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // getProfile 回傳 { success: true, data: user }
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 99);
      expect(res.body.data).toHaveProperty('role', 'admin');
    });
  });
});