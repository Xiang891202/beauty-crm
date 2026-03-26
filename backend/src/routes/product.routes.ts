console.log('Product routes loaded');
import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 公開路由（若需要）
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// 需要管理員權限的路由
router.post('/', authenticate, roleMiddleware(['admin']), productController.createProduct);
router.put('/:id', authenticate, roleMiddleware(['admin']), productController.updateProduct);
router.delete('/:id', authenticate, roleMiddleware(['admin']), productController.deleteProduct);

export default router;