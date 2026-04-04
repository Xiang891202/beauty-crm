import db from '../config/db';
import { Service } from '../types';
import { deleteImage } from '../utils/upload';

// 取得所有未刪除的服務（前台用）
export const findAll = async (): Promise<Service[]> => {
  const result = await db.query('SELECT * FROM services WHERE deleted_at IS NULL ORDER BY id ASC');
  return result.rows;
};

// 取得所有服務（包含已刪除，管理員用）
export const findAllIncludeDeleted = async (): Promise<Service[]> => {
  const result = await db.query('SELECT * FROM services ORDER BY id ASC');
  return result.rows;
};

// 根據 ID 取得服務，可選擇是否包含已刪除
export const findById = async (id: number, includeDeleted = false): Promise<Service | null> => {
  let query = 'SELECT * FROM services WHERE id = $1';
  if (!includeDeleted) {
    query += ' AND deleted_at IS NULL';
  }
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// 建立服務
export const create = async (data: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Service> => {
  const { name, description, price, duration_minutes, image_url } = data;
  const result = await db.query(
    `INSERT INTO services (name, description, price, duration_minutes, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, price, duration_minutes, image_url || null]
  );
  return result.rows[0];
};

// 更新服務
export const update = async (id: number, data: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
  const fields: string[] = [];
  const values: any[] = [];   // ← 显式声明为 any[]
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }
  if (fields.length === 0) {
    const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  }
  values.push(id);
  const query = `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
};

// 軟刪除
export const softDelete = async (id: number): Promise<boolean> => {
  const result = await db.query(
    'UPDATE services SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

// 恢復軟刪除
export const restore = async (id: number): Promise<boolean> => {
  const result = await db.query(
    'UPDATE services SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

// 永久刪除（硬刪除）並刪除圖片
export const hardDelete = async (id: number): Promise<boolean> => {
  const service = await findById(id, true);
  if (service?.image_url) {
    await deleteImage(service.image_url);
  }
  const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
};