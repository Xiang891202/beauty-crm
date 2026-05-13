import db from '../config/db';
import { Service } from '../types';
import { deleteImage } from '../utils/upload';

// 常用：追加租户条件，并返回下一个占位符索引
function appendTenant(conditions: string[], values: any[], tenantId: number | undefined, idx: number): number {
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    return idx + 1; // 占位符索引加1
  }
  return idx;
}

// 取得所有未刪除的服務（前台用，可选 tenant）
export const findAll = async (tenantId?: number): Promise<Service[]> => {
  const conditions: string[] = ['deleted_at IS NULL'];
  const values: any[] = [];
  let idx = 1;
  idx = appendTenant(conditions, values, tenantId, idx);
  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const result = await db.query(`SELECT * FROM services ${whereClause} ORDER BY id ASC`, values);
  return result.rows;
};

// 取得所有服務（包含已刪除，管理員用）
export const findAllIncludeDeleted = async (tenantId?: number): Promise<Service[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;
  idx = appendTenant(conditions, values, tenantId, idx);
  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const result = await db.query(`SELECT * FROM services ${whereClause} ORDER BY id ASC`, values);
  return result.rows;
};

// 根據 ID 取得服務，可選擇是否包含已刪除
export const findById = async (id: number, includeDeleted = false, tenantId?: number): Promise<Service | null> => {
  const conditions: string[] = ['id = $1'];
  const values: any[] = [id];
  let idx = 2;
  if (!includeDeleted) {
    conditions.push('deleted_at IS NULL');
  }
  idx = appendTenant(conditions, values, tenantId, idx);
  const whereClause = ' WHERE ' + conditions.join(' AND ');
  const result = await db.query(`SELECT * FROM services ${whereClause}`, values);
  return result.rows[0] || null;
};

// 建立服務
export const create = async (data: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>, tenantId?: number): Promise<Service> => {
  const { name, description, price, duration_minutes, image_url } = data;
  const fields = ['name', 'description', 'price', 'duration_minutes', 'image_url'];
  const values: any[] = [name, description, price, duration_minutes, image_url || null];
  const placeholders = fields.map((_, i) => `$${i + 1}`);
  if (tenantId) {
    fields.push('tenant_id');
    values.push(tenantId);
    placeholders.push(`$${values.length}`);
  }
  const result = await db.query(
    `INSERT INTO services (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  return result.rows[0];
};

// 更新服務
export const update = async (id: number, data: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>, tenantId?: number): Promise<Service> => {
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
    const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  }
  const conditions: string[] = [];
  // 追加 id 条件
  conditions.push(`id = $${idx}`);
  values.push(id);
  idx++;
  // 追加租户条件
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const query = `UPDATE services SET ${fields.join(', ')} WHERE ${conditions.join(' AND ')} RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
};

// 軟刪除
export const softDelete = async (id: number, tenantId?: number): Promise<boolean> => {
  const conditions = ['id = $1', 'deleted_at IS NULL'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const result = await db.query(
    `UPDATE services SET deleted_at = NOW() WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (result.rowCount ?? 0) > 0;
};

// 恢復軟刪除
export const restore = async (id: number, tenantId?: number): Promise<boolean> => {
  const conditions = ['id = $1', 'deleted_at IS NOT NULL'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const result = await db.query(
    `UPDATE services SET deleted_at = NULL WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (result.rowCount ?? 0) > 0;
};

// 永久刪除（硬刪除）並刪除圖片
export const hardDelete = async (id: number, tenantId?: number): Promise<boolean> => {
  const service = await findById(id, true, tenantId);
  if (service?.image_url) {
    await deleteImage(service.image_url);
  }
  const conditions = ['id = $1'];
  const values: any[] = [id];
  let idx = 2;
  if (tenantId) {
    conditions.push(`tenant_id = $${idx}`);
    values.push(tenantId);
    idx++;
  }
  const result = await db.query(
    `DELETE FROM services WHERE ${conditions.join(' AND ')} RETURNING id`,
    values
  );
  return (result.rowCount ?? 0) > 0;
};