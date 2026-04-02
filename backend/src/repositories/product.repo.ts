import pool from '../config/db';
import { deleteImage } from '../utils/upload';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  image_url?: string;
  deleted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

// 取得所有未刪除的商品（前台用）
export const getProducts = async (): Promise<Product[]> => {
  const res = await pool.query('SELECT * FROM products WHERE deleted_at IS NULL ORDER BY id ASC');
  return res.rows;
};

// 取得所有商品（包含已刪除，管理員用）
export const getAllProductsIncludeDeleted = async (): Promise<Product[]> => {
  const res = await pool.query('SELECT * FROM products ORDER BY id ASC');
  return res.rows;
};

// 取得單一商品，可選擇是否包含已刪除
export const getProductById = async (id: number, includeDeleted: boolean = false): Promise<Product | null> => {
  let query = 'SELECT * FROM products WHERE id = $1';
  if (!includeDeleted) {
    query += ' AND deleted_at IS NULL';
  }
  const res = await pool.query(query, [id]);
  return res.rows[0] || null;
};

// 新增商品
export const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Product> => {
  const { name, price, description, stock, image_url } = data;
  const res = await pool.query(
    `INSERT INTO products (name, price, description, stock, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, price, description || null, stock ?? 0, image_url || null]
  );
  return res.rows[0];
};

// 更新商品
export const updateProduct = async (id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// 軟刪除
export const softDeleteProduct = async (id: number): Promise<boolean> => {
  const res = await pool.query(
    'UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return (res.rowCount ?? 0) > 0;
};

// 恢復軟刪除
export const restoreProduct = async (id: number): Promise<boolean> => {
  const res = await pool.query(
    'UPDATE products SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id',
    [id]
  );
  return (res.rowCount ?? 0) > 0;
};

// 永久刪除（硬刪除）並刪除圖片
export const hardDeleteProduct = async (id: number): Promise<boolean> => {
  const product = await getProductById(id, true);
  if (product?.image_url) {
    await deleteImage(product.image_url);
  }
  const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return (res.rowCount ?? 0) > 0;
};