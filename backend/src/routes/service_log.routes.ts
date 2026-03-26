// src/routes/usage.routes.ts
import { Router } from 'express';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';
// import { roleMiddleware } from '../middleware/role.middleware';
import * as usageController from '../controllers/service_log.controller';
import { validate } from '../middleware/validate.middleware'; // 假设您有一个验证中间件

import {
  createUsageSchema,
  updateUsageNotesSchema,
  listUsagesQuerySchema,
} from '../validators/service_log.validator';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 创建使用记录（仅限员工或管理员）
router.post(
  '/',
  roleMiddleware(['admin', 'staff']),
  validate(createUsageSchema, 'body'),
  usageController.createUsage
);

// 获取使用记录列表（所有登录用户可看）
router.get(
  '/',
  validate(listUsagesQuerySchema, 'query'),
  usageController.listUsages
);

// 获取单个使用记录
router.get('/:id', usageController.getUsage);

// 更新使用记录备注（仅限员工或管理员）
router.patch(
  '/:id/notes',
  roleMiddleware(['admin', 'staff']),
  validate(updateUsageNotesSchema, 'body'),
  usageController.updateUsageNotes
);

export default router;