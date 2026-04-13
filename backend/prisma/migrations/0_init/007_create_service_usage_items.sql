-- =====================================================
-- 建立使用品項關聯表（多對多）
-- 記錄每次使用所選的服務項目
-- 日期: 2026-04-13
-- =====================================================

CREATE TABLE IF NOT EXISTS service_usage_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usage_log_id UUID NOT NULL REFERENCES service_usage_logs(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_usage_items_usage_log ON service_usage_items(usage_log_id);
CREATE INDEX IF NOT EXISTS idx_service_usage_items_service ON service_usage_items(service_id);