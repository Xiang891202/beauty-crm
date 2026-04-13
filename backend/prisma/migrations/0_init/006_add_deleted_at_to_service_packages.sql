-- =====================================================
-- 為組合包模板增加軟刪除欄位
-- 日期: 2026-04-13
-- =====================================================

ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;