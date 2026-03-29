import http from '../http';

export const getMemberDetail = (id: number) => {
  return http.get(`/members/${id}`);
};

// 修改：改为调用 /member-services，并传递 customer_id
export const getMemberServices = (customerId: number) => {
  return http.get('/member-services', { params: { customer_id: customerId } });
};

export const getMembers = () => {
  return http.get('/members');
};