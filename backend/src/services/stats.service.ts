import prisma from '../config/prisma';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalMembers: number;
  totalUsage: number;            // 傳統 + 組合包使用次數總和
  dailyUsage: { date: string; count: number }[];
  recentLogs: {
    id: string;
    memberName: string;
    serviceName: string;         // 傳統：服務名稱；組合包：組合包名稱 + 使用項目
    usedAt: string;
    note: string | null;
    signatureImage: string | null;
    type: 'traditional' | 'package'; // 方便前端區分
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 1. 總會員數（不重複）
  const totalMembers = await prisma.customer.count();

  // 2. 總使用次數：傳統 service_logs + 組合包 service_usage_logs
  const traditionalUsageCount = await prisma.serviceLog.count();
  const { count: packageUsageCount } = await supabase
    .from('service_usage_logs')
    .select('*', { count: 'exact', head: true });
  const totalUsage = traditionalUsageCount + (packageUsageCount || 0);

  // 3. 近7日每日使用次數（合併傳統與組合包）
  // 近7日每日使用次數（合併傳統與組合包）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];

    // 傳統服務每日統計
    const traditionalDaily = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE(used_at) as date, COUNT(*) as count
    FROM service_logs
    WHERE used_at >= ${sevenDaysAgo}
    GROUP BY DATE(used_at)
    ORDER BY date ASC
    `;

    // 組合包每日統計
    const { data: packageDaily } = await supabase
    .from('service_usage_logs')
    .select('usage_date')
    .gte('usage_date', startDateStr);

    // 合併每日數據（建立 Map）
    const dailyMap = new Map<string, number>();
    traditionalDaily.forEach(row => {
    const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
    dailyMap.set(dateStr, Number(row.count));
    });
    packageDaily?.forEach(log => {
    const dateStr = log.usage_date;
    dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    });

  // 生成完整日期範圍（7天）
  const dailyUsage: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyUsage.push({ date: dateStr, count: dailyMap.get(dateStr) || 0 });
  }

  // 4. 近期使用記錄（合併傳統與組合包，取前10筆，依時間倒序）
  // 傳統服務最近記錄
  const traditionalRecent = await prisma.serviceLog.findMany({
    take: 10,
    orderBy: { used_at: 'desc' },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
  // 組合包最近記錄（簡化版，不關聯 items）
    const { data: packageRecent } = await supabase
    .from('service_usage_logs')
    .select(`
        id,
        created_at,
        notes,
        signature_url,
        snapshot_package_name,
        customer:customers(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10) as any;

    // 合併兩者，取時間最近的10筆
    const allLogs: any[] = [];

    traditionalRecent.forEach(log => {
    allLogs.push({
        id: `trad_${log.id}`,
        memberName: log.customer?.name || `客戶 ${log.customer_id}`,
        serviceName: log.service?.name || `服務 ${log.service_id}`,
        usedAt: log.used_at,
        note: log.notes,
        signatureImage: log.signature_url,
        type: 'traditional',
    });
    });

    packageRecent?.forEach(log => {
    allLogs.push({
        id: `pkg_${log.id}`,
        memberName: (log.customer as any)?.name || `客戶 ${log.customer_id}`,
        serviceName: log.snapshot_package_name || '組合包',
        usedAt: log.created_at,
        note: log.notes,
        signatureImage: log.signature_url,
        type: 'package',
    });
    });

  // 排序取前10
  allLogs.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
  const recentLogs = allLogs.slice(0, 10);

  return {
    totalMembers,
    totalUsage,
    dailyUsage,
    recentLogs,
  };
};