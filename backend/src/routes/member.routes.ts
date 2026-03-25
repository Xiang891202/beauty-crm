import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// 公開路由（所有人可查看會員列表與詳情）
router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMember);

// 需要管理員權限的路由
router.post('/', authenticate, requireRole(['admin']), memberController.createMember);
router.put('/:id', authenticate, requireRole(['admin']), memberController.updateMember);
router.delete('/:id', authenticate, requireRole(['admin']), memberController.deleteMember);

export default router;