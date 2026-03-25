import pool from '../config/db';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  created_at?: Date;
  updated_at?: Date;
}

//取得商品
export const getProducts = async (): Promise<Product[]> => {
  // 1. 使用 pool.query 執行 SQL: SELECT * FROM products ORDER BY id ASC
  const res = await pool.query('SELECT * FROM products ORDER BY id ASC');
  // 2. 返回 res.rows
  return res.rows;
  // throw new Error('Not implemented');
};

//取得單一商品
export const getProductById = async (id: number): Promise<Product | null> => {
  // 使用參數化查詢：SELECT * FROM products WHERE id = $1  // 將 id 作為參數傳入
  const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  // 如果 res.rows[0] 存在則回傳，否則回傳 null
  return res.rows[0] || null;
  // throw new Error('Not implemented');
};


//新增商品
export const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  // data 包含 name, price, description?, stock?
  const { name, price, description, stock } = data;
  // 用 INSERT INTO ... RETURNING * 取得新增的完整資料
  const res = await pool.query(
   `INSERT INTO products (name, price, description, stock)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
   // 注意處理 description 可能為 undefined，可傳 null
   [name, price, description || null, stock ?? 0]
  );
  return res.rows[0];
  // throw new Error('Not implemented');
};


//更新商品
export const updateProduct = async (id: number, data: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> => {
  // 動態組合 SET 子句，只更新有傳入的欄位   // 使用 $1, $2, ... 佔位符
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  // 动态构建 SET 子句
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) {
    // 没有要更新的字段，直接返回现有记录
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  // 自动更新 updated_at
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};


//刪除商品
export const deleteProduct = async (id: number): Promise<boolean> => {
  // DELETE FROM products WHERE id = $1 RETURNING id
  const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  // 如果 res.rowCount > 0 表示刪除成功，回傳 true，否則 false
  return (res.rowCount ?? 0) > 0;
  // throw new Error('Not implemented');
};