import * as productRepo from '../repositories/product.repo';

export const getAllProducts = async (includeDeleted = false, tenantId?: number) => {
  if (includeDeleted) {
    return await productRepo.getAllProductsIncludeDeleted(tenantId);
  }
  return await productRepo.getProducts(tenantId);
};

export const getProduct = async (id: number, includeDeleted = false, tenantId?: number) => {
  return await productRepo.getProductById(id, includeDeleted, tenantId);
};

export const addProduct = async (data: any, tenantId?: number) => {
  return await productRepo.createProduct(data, tenantId);
};

export const modifyProduct = async (id: number, data: any, tenantId?: number) => {
  return await productRepo.updateProduct(id, data, tenantId);
};

export const removeProduct = async (id: number, tenantId?: number) => {
  return await productRepo.softDeleteProduct(id, tenantId);
};

export const restoreProduct = async (id: number, tenantId?: number) => {
  return await productRepo.restoreProduct(id, tenantId);
};

export const permanentlyDeleteProduct = async (id: number, tenantId?: number) => {
  return await productRepo.hardDeleteProduct(id, tenantId);
};