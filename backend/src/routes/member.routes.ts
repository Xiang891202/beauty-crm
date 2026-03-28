import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 公開路由（所有人可查看會員列表與詳情）
router.get('/', memberController.getMembers);
router.get('/:id/services', memberController.getMemberServices);
router.get('/:id', memberController.getMember);

// 需要管理員權限的路由
router.post('/', authenticate, roleMiddleware(['admin']), memberController.createMember);
router.put('/:id', authenticate, roleMiddleware(['admin']), memberController.updateMember);
router.delete('/:id', authenticate, roleMiddleware(['admin']), memberController.deleteMember);

export default router;