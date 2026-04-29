import http from './http';
//0223969314
//0800219777

export const getGifts = (params?: { member_package_id?: string; is_redeemed?: boolean }) =>
  http.get('/admin/member-packages/gifts/all', { params });

export const createGift = (data: { member_package_id: string; gift_description: string; notes?: string }) =>
  http.post('/admin/member-packages/gifts', data);

export const updateGift = (id: string, data: Partial<{ gift_description: string; is_redeemed: boolean; notes: string }>) =>
  http.put(`/admin/member-packages/gifts/${id}`, data);

export const deleteGift = (id: string) =>
  http.delete(`/admin/member-packages/gifts/${id}`);