
import pool  from "../config/db";
import { User } from '../types'


// 骨架：實際資料庫操作後續補齊
//根據郵箱查詢用戶
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

//創建用戶
export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  const { email, password_hash, role } = data;
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [email, password_hash, role]
  );
  return result.rows[0];
};