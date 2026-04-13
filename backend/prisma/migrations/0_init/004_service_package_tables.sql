-- =====================================================
-- 組合包相關資料表（主要結構）
-- 建立時間: 2026-04-13
-- 說明: 組合包模板、會員購買實例、贈品表
-- =====================================================

-- 組合包模板
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 組合包模板項目（多對多：組合包 -> 服務項目 + 次數）
CREATE TABLE IF NOT EXISTS service_package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(package_id, service_id)
);

-- 會員購買的組合包實例（快照）
CREATE TABLE IF NOT EXISTS member_service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE RESTRICT,
    snapshot_name VARCHAR(100) NOT NULL,
    snapshot_description TEXT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    total_uses INTEGER NOT NULL DEFAULT 0,
    remaining_uses INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 快照內各服務項目的剩餘次數（已廢棄，改用總次數模式，但保留表結構）
CREATE TABLE IF NOT EXISTS member_service_package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_package_id UUID NOT NULL REFERENCES member_service_packages(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    original_quantity INTEGER NOT NULL CHECK (original_quantity > 0),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_package_id, service_id)
);

-- 使用紀錄表（擴充欄位）
ALTER TABLE service_usage_logs 
ADD COLUMN IF NOT EXISTS snapshot_package_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS selected_service_ids INTEGER[];

-- 贈品表
CREATE TABLE IF NOT EXISTS package_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_package_id UUID NOT NULL REFERENCES member_service_packages(id) ON DELETE CASCADE,
    gift_description VARCHAR(255) NOT NULL,
    is_redeemed BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMPTZ,
    notes TEXT,
    service_usage_log_id UUID REFERENCES service_usage_logs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_member_service_packages_customer_id ON member_service_packages(customer_id);
CREATE INDEX IF NOT EXISTS idx_member_service_packages_status ON member_service_packages(status);
CREATE INDEX IF NOT EXISTS idx_service_usage_logs_member_package_id ON service_usage_logs(member_package_id);
CREATE INDEX IF NOT EXISTS idx_package_gifts_member_package_id ON package_gifts(member_package_id);

-- 自動更新 updated_at 的觸發器（若尚未定義）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_packages_updated_at') THEN
        CREATE TRIGGER update_service_packages_updated_at
            BEFORE UPDATE ON service_packages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_member_service_packages_updated_at') THEN
        CREATE TRIGGER update_member_service_packages_updated_at
            BEFORE UPDATE ON member_service_packages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;