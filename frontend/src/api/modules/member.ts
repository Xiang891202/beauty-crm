import http from '../http';

export const getMemberServices = (memberId: number) => {
  return http.get(`/members/${memberId}/services`);
};