import http from '../http';
import type { ApiResponse } from '@/types';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
}

export const getProducts = (): Promise<ApiResponse<Product[]>> => {
  return http.get('/products');
};

export const createProduct = (data: FormData) => {
  return http.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateProduct = (id: number, data: FormData) => {
  return http.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};