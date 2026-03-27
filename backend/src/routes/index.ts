import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';
import memberServiceRoutes from './member_service.routes';  // 新增
import serviceLogRoutes from './service_log.routes';
import adjustmentRoutes from './adjustment.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/members', memberRoutes);
router.use('/services', serviceRoutes);
router.use('/member-services', memberServiceRoutes);        // 新增
router.use('/service-logs', serviceLogRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/public', publicRoutes);

export default router;