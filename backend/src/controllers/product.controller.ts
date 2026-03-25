import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    successResponse(res, products);
  } catch (err) {
    console.error('Error in getProducts:', err); // 新增這行
    errorResponse(res, 'Failed to fetch products');
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const product = await productService.getProduct(id);
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, product);
  } catch (err) {
    errorResponse(res, 'Failed to fetch product');
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.addProduct(req.body);
    successResponse(res, product, 201);
  } catch (err) {
    console.error('Error in createProduct:', err);
    errorResponse(res, 'Failed to create product');
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const product = await productService.modifyProduct(id, req.body);
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, product);
  } catch (err) {
    errorResponse(res, 'Failed to update product');
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const success = await productService.removeProduct(id);
    if (!success) return errorResponse(res, 'Product not found', 404);
    res.status(204).send();
  } catch (err) {
    errorResponse(res, 'Failed to delete product');
  }
};