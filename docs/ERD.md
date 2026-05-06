# ERD (Entity Relationship Diagram)

## 核心資料表

### customers（會員）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT (PK) | 會員編號 |
| name | VARCHAR | 姓名 |
| phone | VARCHAR | 手機號碼（唯一） |
| email | VARCHAR | 電子郵件 |
| birthday | DATE | 生日 |
| address | VARCHAR | 地址 |
| notes | TEXT | 備註 |
| password_hash | VARCHAR | 密碼雜湊 |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

### services（服務項目）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT (PK) | 服務編號 |
| name | VARCHAR | 服務名稱 |
| description | TEXT | 描述 |
| price | DECIMAL | 價格 |
| duration_minutes | INT | 時長（分鐘） |
| image_url | VARCHAR | 圖片網址 |
| is_active | BOOLEAN | 是否啟用 |
| deleted_at | TIMESTAMP | 軟刪除時間 |

### member_services（傳統服務包）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT (PK) | 授權編號 |
| customer_id | INT (FK) | 會員編號 |
| service_id | INT (FK) | 服務編號 |
| total_sessions | INT | 總次數 |
| remaining_sessions | INT | 剩餘次數 |
| purchased_at | TIMESTAMP | 購買時間 |
| expiry_date | DATE | 到期日 |

### service_packages（組合包模板）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID (PK) | 組合包編號 |
| name | VARCHAR | 組合包名稱 |
| description | TEXT | 描述 |
| price | DECIMAL | 售價 |
| duration_days | INT | 有效天數 |
| is_active | BOOLEAN | 是否啟用 |
| deleted_at | TIMESTAMP | 軟刪除時間 |

### service_package_items（組合包品項）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID (PK) | 品項編號 |
| package_id | UUID (FK) | 組合包編號 |
| service_id | INT (FK) | 服務編號 |
| quantity | INT | 次數 |

### member_service_packages（會員組合包）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID (PK) | 購買記錄編號 |
| customer_id | INT (FK) | 會員編號 |
| package_id | UUID (FK) | 組合包編號 |
| snapshot_name | VARCHAR | 快照名稱 |
| snapshot_description | TEXT | 快照描述 |
| purchase_date | DATE | 購買日期 |
| expiry_date | DATE | 到期日 |
| total_uses | INT | 總次數 |
| remaining_uses | INT | 剩餘次數 |
| status | VARCHAR | 狀態 (active/used_up/expired) |

### service_logs（傳統服務使用記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT (PK) | 記錄編號 |
| customer_id | INT (FK) | 會員編號 |
| member_service_id | INT (FK) | 服務授權編號 |
| service_id | INT (FK) | 服務編號 |
| used_at | TIMESTAMP | 使用時間 |
| notes | TEXT | 備註 |
| signature_url | VARCHAR | 簽名圖片 URL |
| created_by | INT | 操作人員 |

### service_usage_logs（組合包使用記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID (PK) | 記錄編號 |
| customer_id | INT (FK) | 會員編號 |
| member_package_id | UUID (FK) | 組合包編號 |
| usage_date | TIMESTAMP | 使用時間 |
| notes | TEXT | 備註 |
| signature_url | VARCHAR | 簽名圖片 URL |
| snapshot_package_name | VARCHAR | 快照名稱 |
| selected_service_ids | JSON | 使用的服務 ID 陣列 |

### adjustments（調整記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT (PK) | 記錄編號 |
| member_service_id | INT | 服務授權編號 |
| member_package_id | UUID | 組合包編號 |
| adjustment_type | VARCHAR | 類型 (INCREASE/DECREASE) |
| amount | INT | 調整數量 |
| reason | TEXT | 原因 |
| created_by | INT | 操作人員 |

### idempotency_records（冪等性記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| key | VARCHAR (PK) | 冪等性 Key |
| response | JSONB | 原始回應 |
| created_at | TIMESTAMP | 建立時間 |

## 關聯圖（文字版）
customers ──┬── member_services ──── service_logs
│ │
│ services
│
├── member_service_packages ── service_usage_logs
│ │
│ service_packages ── service_package_items ── services
│
└── adjustments