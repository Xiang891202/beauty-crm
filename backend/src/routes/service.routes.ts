import { Router } from 'express';
import { upload } from '../middleware/upload';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as serviceController from '../controllers/service.controller';

const router = Router();

// 公開路由
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// 管理員專用：取得所有服務（含已刪除）
router.get(
  '/admin/all',
  authenticate,
  roleMiddleware(['admin']),
  serviceController.getAllServicesAdmin
);

// 管理員專用：新增、更新、軟刪除、恢復、永久刪除
router.post(
  '/',
  authenticate,
  roleMiddleware(['admin']),
  upload.single('image'),
  serviceController.createService
);
router.put(
  '/:id',
  authenticate,
  roleMiddleware(['admin']),
  upload.single('image'),
  serviceController.updateService
);
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(['admin']),
  serviceController.deleteService
);
router.post(
  '/:id/restore',
  authenticate,
  roleMiddleware(['admin']),
  serviceController.restoreService
);
router.delete(
  '/:id/permanent',
  authenticate,
  roleMiddleware(['admin']),
  serviceController.hardDeleteService
);

export default router;