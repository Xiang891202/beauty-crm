import { Router } from 'express'
import { getDashboardStats } from '../controllers/stats.controller'
import { authMiddleware } from '../middleware/auth.middleware'
// import { roleMiddleware } from '../middleware/error.middleware'

const router = Router()

// 只有 admin 可以存取儀表板統計
router.get(
  '/admin/stats',
  authMiddleware,
  getDashboardStats
)

export default router