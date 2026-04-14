import { Router } from 'express';
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

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/members', memberRoutes);
router.use('/services', serviceRoutes);
router.use('/member-services', memberServiceRoutes);
router.use('/service-packages', servicePackageRoutes);          // 組合包 CRUD
router.use('/admin/member-packages', adminMemberPackageRoutes); // 購買、扣次等
router.use('/public', publicRoutes);                            // 客戶登入 + 客戶查詢
router.post('/packages/:id/restore', restorePackage);
router.use('/service-logs', serviceLogRoutes);
router.use('/adjustments', adjustmentRoutes);

export default router;