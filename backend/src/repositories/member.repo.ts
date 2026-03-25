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
  created_at?: Date;
  updated_at?: Date;
}

// 1. 取得所有會員
export const getMembers = async (): Promise<Member[]> => {
  // 使用 pool.query 執行 SELECT * FROM members ORDER BY id ASC
  const res = await pool.query('SELECT * FROM members ORDER BY id ASC');
  // 回傳 res.rows
  return res.rows;
};


// 2. 根據 ID 取得單一會員
export const getMemberById = async (id: number): Promise<Member | null> => {
  // 使用參數化查詢 SELECT * FROM members WHERE id = $1
  const res = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
  // 回傳 res.rows[0] 或 null
  return res.rows[0] || null;
};


// 3. 新增會員
export const createMember = async (
  data: Omit<Member, 'id' | 'created_at' | 'updated_at'>
): Promise<Member> => {
  // 從 data 解構出 name, phone, email, points, birthday, gender, address, notes
  const { name, phone, email, points, birthday, gender, address, notes } = data;
  // 使用 INSERT INTO ... RETURNING *
  const res = await pool.query(
    `INSERT INTO members (name, phone, email, points, birthday, gender, address, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
     [
        // 注意處理 undefined 值，可轉為 null
      name,
      phone || null,
      email || null,
      points ?? 0,
      birthday || null,
      gender || null,
      address || null,
      notes || null,
    ]
  );
  return res.rows[0];
};


// 4. 更新會員（動態組合 SET 子句）
export const updateMember = async (
  id: number,
  data: Partial<Omit<Member, 'id' | 'created_at'>>
): Promise<Member | null> => {
  // 動態建立 fields 陣列和 values 陣列
  const fields: string[] = [];
  const values: any[] =[];
  let idx = 1;
  // 參考 product.repo.ts 的 updateProduct 寫法
  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(data.phone);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.points !== undefined) {
    fields.push(`points = $${idx++}`);
    values.push(data.points);
  }
  if (data.birthday !== undefined) {
    fields.push(`birthday = $${idx++}`);
    values.push(data.birthday);
  }
  if (data.gender !== undefined) {
    fields.push(`gender = $${idx++}`);
    values.push(data.gender);
  }
  if (data.address !== undefined) {
    fields.push(`address = $${idx++}`);
    values.push(data.address);
  }
  if (data.notes !== undefined) {
    fields.push(`notes = $${idx++}`);
    values.push(data.notes);
  }

  if (fields.length === 0) return null;
  // 最後用 UPDATE ... SET ... WHERE id = $n RETURNING *
  values.push(id);
  const query = `
    UPDATE members
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${idx}
    RETURNING *
  `;
  const res = await pool.query(query, values);
  return res.rows[0] || null;
};

// 5. 刪除會員
export const deleteMember = async (id: number): Promise<boolean> => {
  // DELETE FROM members WHERE id = $1 RETURNING id
  const res = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [id]);
  // 根據 rowCount 回傳 true/false
   return (res.rowCount ?? 0) > 0;
};