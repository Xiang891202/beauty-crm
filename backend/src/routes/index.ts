import { Router, RequestHandler } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';
import memberServiceRoutes from './member_service.routes';
import servicePackageRoutes from './service-package.routes';
import adminMemberPackageRoutes from './member-package.routes';
import publicRoutes from './public.routes';
import { restorePackage } from '../controllers/service-package.controller';
import serviceLogRoutes from './service_log.routes';
import adjustmentRoutes from './adjustment.routes';
import statsRoutes from './stats.routes';
import { tenantContext } from '../middleware/tenant.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as memberController from '../controllers/member.controller'; // 新增

const router = Router();

router.use('/auth', authRoutes);

const isMultiTenant = process.env.MULTI_TENANT === 'true';

const protect = (...handlers: RequestHandler[]) => {
  if (isMultiTenant) {
    return [authenticate, tenantContext, ...handlers] as RequestHandler[];
  }
  return [authenticate, ...handlers] as RequestHandler[];
};

// ========== 公开路由（不需要认证） ==========
router.get('/members', memberController.getMembers);
router.get('/members/:id/services', memberController.getMemberServices);
router.get('/members/:id', memberController.getMember);

// ========== 受保护路由 ==========
router.use('/admin', ...protect(statsRoutes));
router.use('/products', ...protect(productRoutes));
router.use('/members', ...protect(memberRoutes));   // 仅包含 POST, PUT, DELETE
router.use('/services', ...protect(serviceRoutes));
router.use('/member-services', ...protect(memberServiceRoutes));
router.use('/service-packages', ...protect(servicePackageRoutes));
router.use('/admin/member-packages', ...protect(adminMemberPackageRoutes));
router.use('/service-logs', ...protect(serviceLogRoutes));
router.use('/adjustments', ...protect(adjustmentRoutes));
router.post('/packages/:id/restore', ...protect(restorePackage));

// 其他公开路由
router.use('/public', publicRoutes);

export default router;