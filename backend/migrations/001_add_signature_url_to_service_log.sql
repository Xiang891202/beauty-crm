-- 对应实际表名 service_logs
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS signature_url TEXT;