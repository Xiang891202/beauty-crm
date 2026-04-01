import  http  from '../http';

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
  const response = await http.get<{ success: boolean; data: DashboardStats }>('/admin/stats');
  return response;
};