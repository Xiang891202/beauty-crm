import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(successResponse(products));
  } catch (err) {
    console.error('Error in getProducts:', err); // 新增這行
    res.status(500).json(errorResponse('Failed to fetch products', 500));
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const product = await productService.getProduct(id);
    if (!product) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }
    res.json(successResponse(product));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch product', 500));
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.addProduct(req.body);
    res.status(201).json(successResponse(product));
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(500).json(errorResponse('Failed to create product', 500));
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const product = await productService.modifyProduct(id, req.body);
    if (!product) { 
      return res.status(404).json(errorResponse('Product not found', 404));
    }
    res.json(successResponse(product));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to update product', 500));
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const success = await productService.removeProduct(id);
    if (!success) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete product', 500));
  }
};