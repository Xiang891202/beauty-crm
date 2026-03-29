import http from '../http';

export const createAdjustment = (data: {
  member_service_id: number;
  adjustment_type: 'INCREASE' | 'DECREASE';
  amount: number;
  reason?: string;
}) => {
  return http.post('/adjustments', data);
};