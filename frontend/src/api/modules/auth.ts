import http from '../http';

export const login = (email: string, password: string) => {
  return http.post('/auth/login', { email, password });
};

export const logout = () => {
  return http.post('/auth/logout');
};

// 可选：获取当前用户信息
export const getProfile = () => {
  return http.get('/auth/profile');
};