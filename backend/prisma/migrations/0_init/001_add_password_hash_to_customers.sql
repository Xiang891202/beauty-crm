-- 005_add_password_hash_to_customers.sql
-- 为 customers 表增加 password_hash 字段，用于存储客户登录密码（哈希值）
ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255) NULL;