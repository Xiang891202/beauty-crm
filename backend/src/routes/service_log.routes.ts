// backend/src/routes/service_log.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
import * as usageController from '../controllers/service_log.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createUsageSchema,
  updateUsageNotesSchema,
  listUsagesQuerySchema,
} from '../validators/service_log.validator';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// 創建使用記錄
router.post(
  '/',
  roleMiddleware(['admin', 'staff']),
  upload.single('signature'),
  validate(createUsageSchema, 'body'),
  usageController.createUsage
);

// 獲取使用記錄列表
router.get('/', validate(listUsagesQuerySchema, 'query'), usageController.listUsages);

// 客戶查看自己的使用記錄
router.get('/customers/me/service-logs', usageController.getMyServiceLogs);  // 假設 controller 中有此函數

// 獲取單筆記錄
router.get('/:id', usageController.getUsage);

// 更新備註
router.patch(
  '/:id/notes',
  roleMiddleware(['admin', 'staff']),
  validate(updateUsageNotesSchema, 'body'),
  usageController.updateUsageNotes
);

export default router;