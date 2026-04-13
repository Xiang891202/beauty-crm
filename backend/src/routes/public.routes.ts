import { Router } from 'express';
import { customerLogin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { customerLoginSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
// 從組合包控制器導入客戶端唯讀函數
import { getMyPackages, getMyUsageLogs } from '../controllers/member-package.controller';

const router = Router();

// 客戶登入（公開）
router.post('/auth/customer/login', validate(customerLoginSchema), customerLogin);

// 客戶唯讀 API（需要登入）
router.get('/my/service-packages', authMiddleware, getMyPackages);
router.get('/my/usage-logs', authMiddleware, getMyUsageLogs);

export default router;