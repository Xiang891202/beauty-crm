import dotenv from 'dotenv';
import path from 'path';

// 根據環境變數 APP_ENV 決定載入哪個檔案
const envName = process.env.APP_ENV || 'personal';
const envFile = envName === 'customer' ? '.env.customer' : '.env.personal';
const envPath = path.resolve(process.cwd(), envFile);
console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

// 其餘程式碼
import app from './app';
import { env } from './config/env';

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});