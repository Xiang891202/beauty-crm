import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as memberServiceController from '../controllers/member_service.controller';

const router = Router();

// 所有路由都需要認證
router.use(authenticate);

router.get('/', memberServiceController.getMemberServices);
router.get('/:id', memberServiceController.getMemberService);
router.post('/', roleMiddleware(['admin', 'staff']), memberServiceController.createMemberService);
router.put('/:id', roleMiddleware(['admin', 'staff']), memberServiceController.updateMemberService);
router.delete('/:id', roleMiddleware(['admin']), memberServiceController.deleteMemberService);

export default router;