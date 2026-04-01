// backend/src/routes/adjustment.routes.ts
import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as adjustmentController from '../controllers/adjustment.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createAdjustmentSchema,
  listAdjustmentsQuerySchema,
} from '../validators/adjustment.validator';

const router = Router();

router.use(authenticate);

// 創建調整記錄
router.post(
  '/',
  roleMiddleware(['admin']),
  validate(createAdjustmentSchema, 'body'),
  adjustmentController.createAdjustment
);

// 列表查詢
router.get('/', validate(listAdjustmentsQuerySchema, 'query'), adjustmentController.listAdjustments);

// 獲取單筆
router.get('/:id', adjustmentController.getAdjustment);

// 客戶查看自己的調整紀錄
router.get('/customers/me/adjustments', adjustmentController.getMyAdjustments);

export default router;