// api/modules/service.ts
import http from '../http';


export const getMyServices = () => {
  return http.get('/customers/me/member-services');
};