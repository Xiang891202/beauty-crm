import { Request, Response } from 'express';
import { getDashboardStats as getDashboardStatsService } from '../services/stats.service';
import { successResponse, errorResponse } from '../utils/response';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsService();
    res.json(successResponse(stats));
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json(errorResponse('取得儀表板資料失敗', 500));
  }
};