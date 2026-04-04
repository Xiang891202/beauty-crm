import { Router } from 'express';
import { upload } from '../middleware/upload';
import * as productController from '../controllers/product.controller';
import { authenticate, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 公開路由（未登入）只顯示未刪除的商品
router.get('/', productController.getProducts);

// 管理員專用：取得所有商品（含已刪除）
router.get(
  '/admin/all',
  authenticate,
  roleMiddleware(['admin']),
  productController.getAllProductsAdmin
);

// 管理員專用：新增商品
router.post(
  '/',
  authenticate,
  roleMiddleware(['admin']),
  upload.single('image'),
  productController.createProduct
);

// 管理員專用：更新商品
router.put(
  '/:id',
  authenticate,
  roleMiddleware(['admin']),
  upload.single('image'),
  productController.updateProduct
);

// 軟刪除
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(['admin']),
  productController.deleteProduct
);

// 恢復軟刪除
router.post(
  '/:id/restore',
  authenticate,
  roleMiddleware(['admin']),
  productController.restoreProduct
);

// 永久刪除
router.delete(
  '/:id/permanent',
  authenticate,
  roleMiddleware(['admin']),
  productController.hardDeleteProduct
);

export default router;