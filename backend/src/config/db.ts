import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';  // 新增這行

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('DATABASE_URL from env:', process.env.DATABASE_URL); // 檢查是否讀取成功

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false   // 開發環境可暫時關閉，正式環境建議 true
  }
});

export default pool;