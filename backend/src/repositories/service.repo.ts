import db from '../config/db'; // 你的数据库连接实例
import { Service } from '../types';

/**
 * 查找所有服务
 */
export const findAll = async (): Promise<Service[]> => {
  const resulf = await db.query('SELECT * FROM services ORDER BY id ASC');
  return resulf.rows;
};

/**
 * 根据ID查找服务
 */
export const findById = async (id: number): Promise<Service | null> => {
  const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * 创建服务
 */
export const create = async (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  const { name, description, price, duration_minutes } = data;
  const result = await db.query(
    `INSERT INTO services (name, description, price, duration_minutes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, price, duration_minutes]
  );
  return result.rows[0];
};

/**
 * 更新服务
 */
export const update = async (id: number, data: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }
  values.push(id);
  const query = `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * 删除服务
 */
export const remove = async (id: number): Promise<void> => {
    await db.query('DELETE FROM services WHERE id = $1', [id]);
}