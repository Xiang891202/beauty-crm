// backend/src/routes/member_service.routes.ts
import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as memberServiceController from '../controllers/member_service.controller';

const router = Router();

// 所有路由都需要認證
router.use(authenticate);

// 客戶查看自己的服務授權
router.get('/customers/me/member-services', memberServiceController.getMyMemberServices);

// 管理員查看客戶服務授權
router.get('/customers/:customerId/member-services', roleMiddleware(['admin']), memberServiceController.getMemberServicesByCustomer);

// 其他 CRUD 路由
router.post('/', roleMiddleware(['admin', 'staff']), memberServiceController.createMemberService);
router.put('/:id', roleMiddleware(['admin', 'staff']), memberServiceController.updateMemberService);
router.delete('/:id', roleMiddleware(['admin']), memberServiceController.deleteMemberService);

export default router;