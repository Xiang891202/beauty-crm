console.log('Product routes loaded');
import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// 公開路由（若需要）
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// 需要管理員權限的路由
router.post('/', authenticate, requireRole(['admin']), productController.createProduct);
router.put('/:id', authenticate, requireRole(['admin']), productController.updateProduct);
router.delete('/:id', authenticate, requireRole(['admin']), productController.deleteProduct);

export default router;