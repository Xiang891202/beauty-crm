// console.log('✅ member-package.routes 被加載了');
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  purchasePackageForCustomer,
  getCustomerPackages,
  getMemberPackageDetail,
  useService,
  adjustRemaining,
  getUsageLogs,
  getGifts,
  getAllGifts,        // 新增
  createGift,         // 新增
  updateGift,         // 新增
  deleteGift,         // 新增
  redeemGift,
} from '../controllers/member-package.controller';

const router = Router();
router.use(authMiddleware, requireAdmin);
router.post('/adjust', adjustRemaining);

router.post('/purchase', purchasePackageForCustomer);
router.get('/packages', getCustomerPackages);           // ?customer_id=1
router.get('/packages/:id', getMemberPackageDetail);
router.post('/use', useService);
router.get('/usage-logs', getUsageLogs);


// 贈品管理
router.get('/gifts/all', getAllGifts);           // 後台管理列表
router.post('/gifts', createGift);               // 新增贈品
router.put('/gifts/:id', updateGift);            // 更新贈品
router.delete('/gifts/:id', deleteGift);         // 刪除贈品
router.get('/gifts', getGifts);                  // 客戶端查詢特定組合包贈品
router.post('/gifts/:id/redeem', redeemGift);    // 兌換贈品

export default router;