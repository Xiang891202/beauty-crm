// backend/prisma.config.js（最終版）
module.exports = {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
};