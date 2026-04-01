// backend/src/controllers/stats.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. 總客戶數（對應 Customer 模型）
    const totalMembers = await prisma.customer.count();

    // 2. 總使用次數（ServiceLog）
    const totalUsage = await prisma.serviceLog.count();

    // 3. 近 7 天每日使用次數（表名 service_logs，欄位 created_at）
    const dailyUsageRaw = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM service_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const dailyUsage = dailyUsageRaw.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));

    // 4. 最近 10 筆使用記錄（含客戶姓名、服務名稱）
    // 根據 schema，ServiceLog 關係欄位名為：customer, member_service, service
    // member_service 內部再關聯 customer 和 service
    const recentLogs = await prisma.serviceLog.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        customer: true,           // 直接關聯 Customer
        member_service: {         // 關聯 MemberService（蛇形命名）
          include: {
            customer: true,       // MemberService 內的 customer
            service: true         // MemberService 內的 service
          }
        },
        service: true             // 直接關聯 Service（如果服務直接寫在 ServiceLog 中）
      }
    });

    // 格式化輸出：優先使用 member_service 中的 customer/service，
    // 若不存在則使用直接的 customer/service（視業務邏輯而定）
    const formattedLogs = recentLogs.map(log => {
      // 從 member_service 中取得客戶與服務資訊
      const ms = log.member_service;
      const customerName = ms?.customer?.name ?? log.customer?.name ?? '未知';
      const serviceName = ms?.service?.name ?? log.service?.name ?? '未知';

      return {
        id: log.id,
        memberName: customerName,
        serviceName: serviceName,
        usedAt: log.used_at,
        note: log.notes,
        signatureImage: log.signature_url
      };
    });

    // 使用 successResponse 包裝成功資料
    res.json(successResponse({
      totalMembers,
      totalUsage,
      dailyUsage,
      recentLogs: formattedLogs
    }));
  } catch (err) {
    console.error('Dashboard stats error:', err);
    // 使用 errorResponse 發送錯誤響應
    res.json(errorResponse('取得儀表板資料失敗', 500));
  }
};