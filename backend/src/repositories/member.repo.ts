import pool from '../config/db';   // 請確保路徑正確

export interface Member {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  points: number;
  birthday?: string;   // ISO 日期字串 'YYYY-MM-DD'
  gender?: string;
  address?: string;
  notes?: string;
  password_hash?: string; // 用於存儲密碼哈希，實際使用時應該放在客戶表中
  created_at?: Date;
  updated_at?: Date;
}

// 1. 取得所有客戶
export const getMembers = async (): Promise<Member[]> => {
  const res = await pool.query('SELECT * FROM customers ORDER BY id ASC');
  return res.rows;
};

// 1-1. 取得所有客戶（僅後台使用，不返回 notes 與 password_hash）
export const getMembersForAdmin = async (): Promise<Partial<Member>[]> => {
  const res = await pool.query(
    `SELECT id, name, phone, email, birthday, address, created_at, updated_at
     FROM customers ORDER BY id ASC`
  );
  return res.rows;
};

// 2. 根據 ID 取得單一客戶
export const getMemberById = async (id: number): Promise<Member | null> => {
  const res = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return res.rows[0] || null;
};

// 2-1. 根據電話取得客戶（檢查唯一性）
export const getMemberByPhone = async (phone: string): Promise<Member | null> => {
  const res = await pool.query('SELECT id, phone FROM customers WHERE phone = $1', [phone]);
  return res.rows[0] || null;
};


// 3. 新增客戶
export const createMember = async (
  data: Omit<Member, 'id' | 'created_at' | 'updated_at'>
): Promise<Member> => {
  const { name, phone, birthday, notes, password_hash } = data;
  const res = await pool.query(
    `INSERT INTO customers (name, phone, birthday, notes, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, phone || null, birthday || null, notes || null, password_hash || null]
  );
  return res.rows[0];
};

// 4. 更新客戶（只更新存在的欄位）
export const updateMember = async (
  id: number,
  data: Partial<Omit<Member, 'id' | 'created_at'>>
): Promise<Member | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(data.phone);
  }
  if (data.birthday !== undefined) {
    fields.push(`birthday = $${idx++}`);
    values.push(data.birthday);
  }
  if (data.notes !== undefined) {
    fields.push(`notes = $${idx++}`);
    values.push(data.notes);
  }

  if (fields.length === 0) return null;
  values.push(id);
  const query = `
    UPDATE customers
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;
  const res = await pool.query(query, values);
  return res.rows[0] || null;
};

// 5. 刪除客戶
export const deleteMember = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
  return (res.rowCount ?? 0) > 0;
};