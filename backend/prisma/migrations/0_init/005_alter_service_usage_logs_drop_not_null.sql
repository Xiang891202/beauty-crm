-- =====================================================
-- 修改 service_usage_logs 的 service_id 約束
-- 原因: 組合包使用記錄不再關聯單一服務，允許 NULL
-- 日期: 2026-04-13
-- =====================================================

ALTER TABLE service_usage_logs ALTER COLUMN service_id DROP NOT NULL;