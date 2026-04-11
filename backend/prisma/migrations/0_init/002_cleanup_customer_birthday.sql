-- ============================================
-- 遷移名稱: cleanup_customer_birthday
-- 目的: 清理 customers 表格的重複生日欄位，移除 notes 欄位
-- 日期: 2025-04-11
-- ============================================

-- 1. 確保 birthday 欄位存在 (若無則新增)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'birthday'
    ) THEN
        ALTER TABLE customers ADD COLUMN birthday DATE;
    END IF;
END $$;

-- 2. 如果有 birth_date 欄位且 birthday 為空，則將 birth_date 複製到 birthday
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'birth_date'
    ) THEN
        UPDATE customers 
        SET birthday = birth_date::DATE 
        WHERE birthday IS NULL AND birth_date IS NOT NULL;
    END IF;
END $$;

-- 3. 刪除 birth_date 欄位 (若存在)
ALTER TABLE customers DROP COLUMN IF EXISTS birth_date;

-- 4. 刪除 notes 欄位 (若存在)
ALTER TABLE customers DROP COLUMN IF EXISTS notes;

-- 5. 確保 phone 欄位有唯一索引 (若無則新增)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone) WHERE phone IS NOT NULL;

-- 6. (可選) 如果原本有 password_hash 欄位但長度不足 255，可擴展 (已是255不用改)
-- 密碼長度8碼由應用層驗證，資料庫不需調整

-- 完成
COMMENT ON TABLE customers IS '客戶資料表，生日欄位使用 birthday，電話為登入帳號';