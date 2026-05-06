// backend/prisma.config.js
// 手動載入環境變數（相容 Render 環境）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.personal') });

module.exports = {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
};