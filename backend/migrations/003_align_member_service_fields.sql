-- 检查并重命名 member_services 表的列
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='member_services' AND column_name='remaining_quota'
    ) THEN
        ALTER TABLE member_services RENAME COLUMN remaining_quota TO remaining_sessions;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='member_services' AND column_name='total_quota'
    ) THEN
        ALTER TABLE member_services RENAME COLUMN total_quota TO total_sessions;
    END IF;
END $$;

-- 确保 service_logs 表的备注字段为 notes（你表里是 note，需要重命名）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='service_logs' AND column_name='note'
    ) THEN
        ALTER TABLE service_logs RENAME COLUMN note TO notes;
    END IF;
END $$;