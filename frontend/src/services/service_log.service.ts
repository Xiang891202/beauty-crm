import axios from 'axios';

const API_BASE = '/api'; // 根据实际后端 API 前缀调整

export const getServiceLogs = (params?: any) => {
  return axios.get(`${API_BASE}/service-logs`, { params }).then(res => res.data);
};

export const createServiceLog = (data: any) => {
  return axios.post(`${API_BASE}/service-logs`, data).then(res => res.data);
};