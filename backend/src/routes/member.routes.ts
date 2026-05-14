import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

router.post('/', roleMiddleware(['admin']), memberController.createMember);
router.put('/:id', roleMiddleware(['admin']), memberController.updateMember);
router.delete('/:id', roleMiddleware(['admin']), memberController.deleteMember);

export default router;