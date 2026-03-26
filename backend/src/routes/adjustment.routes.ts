// src/routes/adjustment.routes.ts
import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
// import { roleMiddleware } from '../middleware/role.middleware';
import * as adjustmentController from '../controllers/adjustment.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createAdjustmentSchema,
  listAdjustmentsQuerySchema,
} from '../validators/adjustment.validator';

const router = Router();

router.use(authenticate);

// 创建修正记录（管理员或特定权限）
router.post(
  '/',
  roleMiddleware(['admin']), // 通常修正权限更严格
  validate(createAdjustmentSchema, 'body'),
  adjustmentController.createAdjustment
);

// 列表查询
router.get(
  '/',
  validate(listAdjustmentsQuerySchema, 'query'),
  adjustmentController.listAdjustments
);

// 获取单条
router.get('/:id', adjustmentController.getAdjustment);

export default router;