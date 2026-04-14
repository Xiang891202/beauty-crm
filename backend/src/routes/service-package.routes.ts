import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  createPackage, 
  getPackages, 
  getPackageById, 
  updatePackage,
  restorePackage,       // 新增 
  deletePackage 
} from '../controllers/service-package.controller';

const router = Router();

// 所有組合包管理 API 需要管理員權限（假設 authMiddleware 已驗證並設置 req.user）
router.use(authMiddleware);

router.post('/packages', createPackage);
router.get('/packages', getPackages);
router.get('/packages/:id', getPackageById);
router.put('/packages/:id', updatePackage);
router.post('/packages/:id/restore', restorePackage); // 新增還原路由
router.delete('/packages/:id', deletePackage);

export default router;