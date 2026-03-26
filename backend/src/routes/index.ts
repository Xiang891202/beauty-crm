import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service_log.routes';
import usageRoutes from './service_log.routes';
import adjustmentRoutes from './adjustment.routes';
import publicRoutes from './public.routes'; // 若需要

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/members', memberRoutes);
router.use('/service-logs', serviceRoutes);
router.use('/usage', usageRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/public', publicRoutes); // 靜態或公開檔案

export default router;