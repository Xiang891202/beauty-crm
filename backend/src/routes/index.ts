import { Router, RequestHandler } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';
import memberServiceRoutes from './member_service.routes';      // 原有的單一服務
import servicePackageRoutes from './service-package.routes';    // 組合包管理（需管理員）
import adminMemberPackageRoutes from './member-package.routes'; // 會員組合包管理（需管理員）
import publicRoutes from './public.routes';                     // 客戶登入 + 客戶唯讀查詢
import { restorePackage } from '../controllers/service-package.controller'; // 還原組合包
import serviceLogRoutes from './service_log.routes';
import adjustmentRoutes from './adjustment.routes';
import statsRoutes from './stats.routes';
import { tenantContext } from '../middleware/tenant.middleware';
import { authenticate } from '../middleware/auth.middleware';  // ✅ 引入 authenticate


const router = Router();

router.use('/auth', authRoutes);

// 用一個變數儲存「是否需要租戶隔離」
const isMultiTenant = process.env.MULTI_TENANT === 'true';

// 輔助函式：自動組合 authenticate + (可選)tenantContext
const protect = (...handlers: RequestHandler[]) => {
  if (isMultiTenant) {
    return [authenticate, tenantContext, ...handlers] as RequestHandler[];
  }
  return [authenticate, ...handlers] as RequestHandler[];
};

// --- 掛載保護路由 ---
router.use('/admin', ...protect(statsRoutes));
router.use('/products', ...protect(productRoutes));
router.use('/members', ...protect(memberRoutes));
router.use('/services', ...protect(serviceRoutes));
router.use('/member-services', ...protect(memberServiceRoutes));
router.use('/service-packages', ...protect(servicePackageRoutes));
router.use('/admin/member-packages', ...protect(adminMemberPackageRoutes));
router.use('/service-logs', ...protect(serviceLogRoutes));
router.use('/adjustments', ...protect(adjustmentRoutes));
router.post('/packages/:id/restore', ...protect(restorePackage));

// 不需保護的公開路由
router.use('/public', publicRoutes);

export default router;
