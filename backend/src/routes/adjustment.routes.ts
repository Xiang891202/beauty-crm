import { Router } from 'express';
const router = Router();

// 可選：增加一個測試路由
router.get('/', (req, res) => {
  res.json({ message: 'Placeholder route' });
});

export default router;