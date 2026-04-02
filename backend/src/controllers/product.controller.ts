import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';
import { uploadImage, deleteImage } from '../utils/upload';

const getNumberId = (id: any): number => {
  const parsed = parseInt(String(id), 10);
  if (isNaN(parsed)) throw new Error('Invalid ID');
  return parsed;
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(successResponse(products));
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json(errorResponse('Failed to fetch products', 500));
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
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
    console.log('req.file:', req.file);
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file, 'products');
      console.log('上傳成功，URL:', imageUrl);
    } else {
      console.log('沒有收到圖片檔案');
    }

    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      image_url: imageUrl,
    };

    const product = await productService.addProduct(productData);
    res.status(201).json(successResponse(product));
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(500).json(errorResponse('Failed to create product', 500));
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const existing = await productService.getProduct(id);
    if (!existing) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      if (existing.image_url) {
        await deleteImage(existing.image_url);
      }
      imageUrl = await uploadImage(req.file, 'products');
    }

    const updateData = { ...req.body, image_url: imageUrl };
    const updated = await productService.modifyProduct(id, updateData);
    res.json(successResponse(updated));
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(500).json(errorResponse('Failed to update product', 500));
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await productService.removeProduct(id);
    if (!success) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }
    res.json(successResponse({ message: 'Product soft deleted' }));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse('Failed to delete product', 500));
  }
};

export const restoreProduct = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await productService.restoreProduct(id);
    if (!success) {
      return res.status(404).json(errorResponse('Product not found or not deleted', 404));
    }
    res.json(successResponse({ message: 'Product restored' }));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to restore product', 500));
  }
};

export const hardDeleteProduct = async (req: Request, res: Response) => {
  try {
    const id = getNumberId(req.params.id);
    const success = await productService.permanentlyDeleteProduct(id);
    if (!success) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json(errorResponse('Failed to permanently delete product', 500));
  }
};

export const getAllProductsAdmin = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts(true);
    res.json(successResponse(products));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch products', 500));
  }
};