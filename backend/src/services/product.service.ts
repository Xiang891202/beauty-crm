import * as productRepo from '../repositories/product.repo';

export const getAllProducts = async (includeDeleted = false) => {
  if (includeDeleted) {
    return await productRepo.getAllProductsIncludeDeleted();  // 修正函數名稱
  }
  return await productRepo.getProducts();
};

export const getProduct = async (id: number, includeDeleted = false) => {
  return await productRepo.getProductById(id, includeDeleted);
};

export const addProduct = async (data: any) => {
  return await productRepo.createProduct(data);
};

export const modifyProduct = async (id: number, data: any) => {
  return await productRepo.updateProduct(id, data);
};

export const removeProduct = async (id: number) => {
  return await productRepo.softDeleteProduct(id);
};

export const restoreProduct = async (id: number) => {
  return await productRepo.restoreProduct(id);
};

export const permanentlyDeleteProduct = async (id: number) => {
  return await productRepo.hardDeleteProduct(id);
};