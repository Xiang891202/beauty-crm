import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as serviceController from '../controllers/service.controller';

const router = Router();

// 公开路由（如需公开查询服务列表，可不加中间件）
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// 管理员路由（需要登录且拥有 admin 角色）
router.post('/', authenticate, roleMiddleware(['admin']), serviceController.createService);
router.put('/:id', authenticate, roleMiddleware(['admin']), serviceController.updateService);
router.delete('/:id', authenticate, roleMiddleware(['admin']), serviceController.deleteService);

export default router;