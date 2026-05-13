import http from '../http';

export interface DashboardStats {
  totalMembers: number;
  totalUsage: number;
  dailyUsage: { date: string; count: number }[];
  recentLogs: {
    id: number;
    memberName: string;
    serviceName: string;
    usedAt: string;
    note: string | null;
    signatureImage: string | null;
  }[];
}

export const getDashboardStats = async () => {
  // http.get 已經回傳了 res.data，其結構直接就是：{ success: boolean; data: DashboardStats }
  const response = await http.get<{ success: boolean; data: DashboardStats }>('/admin/stats');
  return response; 
};

