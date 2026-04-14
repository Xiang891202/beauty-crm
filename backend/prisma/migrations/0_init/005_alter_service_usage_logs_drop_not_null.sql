-- 允許 service_id 為 NULL（組合包使用時不關聯單一服務）
ALTER TABLE service_usage_logs ALTER COLUMN service_id DROP NOT NULL;