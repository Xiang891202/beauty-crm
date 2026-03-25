import * as productRepo from '../repositories/product.repo';

export const getAllProducts = async () => {
  return await productRepo.getProducts();
};

export const getProduct = async (id: number) => {
  return await productRepo.getProductById(id);
};

export const addProduct = async (data: any) => {
  return await productRepo.createProduct(data);
};

export const modifyProduct = async (id: number, data: any) => {
  return await productRepo.updateProduct(id, data);
};

export const removeProduct = async (id: number) => {
  return await productRepo.deleteProduct(id);
};