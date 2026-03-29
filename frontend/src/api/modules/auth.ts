import http from '../http';

export const login = (email: string, password: string) => {
  return http.post('/auth/login', { email, password });
};