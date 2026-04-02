// console.log('Product routes loaded');
import { Router } from 'express';
import { upload } from '../middleware/upload';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 公開路由（未登入）只顯示未刪除的商品
router.get('/', productController.getProducts);

// 管理員專用：獲取全部（含已刪除）
router.get('/admin/all', authenticate, roleMiddleware(['admin']), productController.getAllProductsAdmin);

// 軟刪除（原有 DELETE 路由保持不變，但內部改為軟刪除）
router.delete('/:id', authenticate, roleMiddleware(['admin']), productController.deleteProduct);

// 恢復與永久刪除
router.post('/:id/restore', authenticate, roleMiddleware(['admin']), productController.restoreProduct);
router.delete('/:id/permanent', authenticate, roleMiddleware(['admin']), productController.hardDeleteProduct);

export default router;