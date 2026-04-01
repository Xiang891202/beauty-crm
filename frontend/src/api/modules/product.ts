import http from '../http';
import type { ApiResponse } from '@/types';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string | null;
}

export const getProducts = (): Promise<ApiResponse<Product[]>> => {
  return http.get('/products');
};