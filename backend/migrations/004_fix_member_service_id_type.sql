-- 确保字段完整（如果之前缺少，则添加）
ALTER TABLE member_services ADD COLUMN IF NOT EXISTS total_sessions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE member_services ADD COLUMN IF NOT EXISTS remaining_sessions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE member_services ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE member_services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 为 service_logs 添加 created_by（如果缺失）
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);