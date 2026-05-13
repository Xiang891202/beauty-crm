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

// 取得所有未刪除的商品（前台用，可選租戶）
export const getProducts = async (tenantId?: number): Promise<Product[]> => {
  let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
  const values: any[] = [];
  if (tenantId) {
    query += ' AND tenant_id = $1';
    values.push(tenantId);
  }
  query += ' ORDER BY id ASC';
  const res = await pool.query(query, values);
  return res.rows;
};

// 取得所有商品（包含已刪除，管理員用）
export const getAllProductsIncludeDeleted = async (tenantId?: number): Promise<Product[]> => {
  let query = 'SELECT * FROM products';
  const values: any[] = [];
  if (tenantId) {
    query += ' WHERE tenant_id = $1';
    values.push(tenantId);
  }
  query += ' ORDER BY id ASC';
  const res = await pool.query(query, values);
  return res.rows;
};

// 取得單一商品，可選擇是否包含已刪除
export const getProductById = async (id: number, includeDeleted: boolean = false, tenantId?: number): Promise<Product | null> => {
  let query = 'SELECT * FROM products WHERE id = $1';
  const values: any[] = [id];
  let idx = 2;
  if (!includeDeleted) {
    query += ' AND deleted_at IS NULL';
  }
  if (tenantId) {
    query += ` AND tenant_id = $${idx}`;
    values.push(tenantId);
    idx++;
  }
  const res = await pool.query(query, values);
  return res.rows[0] || null;
};

// 新增商品
export const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>, tenantId?: number): Promise<Product> => {
  const { name, price, description, stock, image_url } = data;
  const fields = ['name', 'price', 'description', 'stock', 'image_url'];
  const values: any[] = [name, price, description || null, stock ?? 0, image_url || null];
  const placeholders = fields.map((_, i) => `$${i + 1}`);
  if (tenantId) {
    fields.push('tenant_id');
    values.push(tenantId);
    placeholders.push(`$${values.length}`);
  }
  const res = await pool.query(
    `INSERT INTO products (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  return res.rows[0];
};

// 更新商品
export const updateProduct = async (id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>, tenantId?: number): Promise<Product | null> => {
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

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  const conditions: string[] = [`id = $${idx}`];
  values.push(id);
  idx++;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }

  const query = `UPDATE products SET ${fields.join(', ')} WHERE ${conditions.join(' AND ')} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// 軟刪除
export const softDeleteProduct = async (id: number, tenantId?: number): Promise<boolean> => {
  const conditions = ['id = $1', 'deleted_at IS NULL'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const res = await pool.query(
    `UPDATE products SET deleted_at = NOW() WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (res.rowCount ?? 0) > 0;
};

// 恢復軟刪除
export const restoreProduct = async (id: number, tenantId?: number): Promise<boolean> => {
  const conditions = ['id = $1', 'deleted_at IS NOT NULL'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const res = await pool.query(
    `UPDATE products SET deleted_at = NULL WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (res.rowCount ?? 0) > 0;
};

// 永久刪除（硬刪除）並刪除圖片
export const hardDeleteProduct = async (id: number, tenantId?: number): Promise<boolean> => {
  const product = await getProductById(id, true, tenantId);
  if (product?.image_url) {
    await deleteImage(product.image_url);
  }
  const conditions = ['id = $1'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const res = await pool.query(
    `DELETE FROM products WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (res.rowCount ?? 0) > 0;
};