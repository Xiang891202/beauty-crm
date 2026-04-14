-- 軟刪除欄位
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;