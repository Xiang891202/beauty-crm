import pool from '@/config/db';

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  birth_date?: string | null;
  address?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createCustomer = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  // 防護：如果 data 為 undefined 或 null，拋出明確錯誤
  if (!data) {
    throw new Error('Customer data is required');
  }

  const { name, phone, email, birth_date, address, notes } = data;
  // 確保必要欄位 name 存在
  if (!name) {
    throw new Error('Customer name is required');
  }

  const safeBirthDate = birth_date && birth_date !== '' ? birth_date : null;

  const result = await pool.query(
    `INSERT INTO customers (name, phone, email, birth_date, address, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, phone, email, safeBirthDate, address, notes]
  );
  return result.rows[0];
};

export const getCustomers = async (): Promise<Customer[]> => {
  const result = await pool.query('SELECT * FROM customers ORDER BY id');
  return result.rows;
};

export const getCustomerById = async (id: number): Promise<Customer | null> => {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer | null> => {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteCustomer = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
  return result.rowCount !== null && result.rowCount > 0;
};