# API 規格文件

## 基礎資訊
- **Base URL**: `http://localhost:5001/api`
- **認證方式**: Bearer Token (JWT)
- **回應格式**:
  ```json
  { "success": true, "data": ... }
  { "success": false, "error": "...", "status": 400 }
認證 (Auth)
POST /auth/login — 管理員登入
權限: 公開

請求:

json
{ "email": "test@gmail.com", "password": "123456" }
回應:

json
{ "success": true, "data": { "token": "...", "user": { "id": 1, "role": "admin" } } }
POST /public/auth/customer/login — 客戶登入
權限: 公開

請求:

json
{ "phone": "0912345678", "password": "password" }
回應:

json
{ "success": true, "data": { "token": "...", "user": { "id": 1, "role": "customer" } } }
會員管理 (Members)
GET /members — 會員列表
權限: 公開

回應: 會員陣列（僅 id, name, phone）

POST /members — 新增會員
權限: 管理員

請求:

json
{ "name": "王美美", "phone": "0912345678", "password": "pass123", "birthday": "1990-01-01" }
GET /members/:id — 會員詳情
權限: 公開

回應: 完整會員資料（不含密碼）

PUT /members/:id — 更新會員
權限: 管理員

DELETE /members/:id — 刪除會員
權限: 管理員

服務管理 (Services)
GET /services — 服務列表
權限: 公開

回應: 未刪除的服務項目

組合包管理 (Service Packages)
GET /service-packages/packages — 組合包列表
權限: 登入

查詢參數: is_active, include_deleted

POST /service-packages/packages — 建立組合包
權限: 管理員

請求:

json
{ "name": "美白組", "price": 2000, "items": [{ "service_id": 1, "quantity": 2 }] }
組合包操作 (Member Packages)
POST /admin/member-packages/purchase — 購買組合包
權限: 管理員

請求:

json
{ "customer_id": 1, "package_id": "uuid", "total_uses": 5, "purchase_date": "2026-05-01" }
POST /admin/member-packages/use — 使用服務（扣次）
權限: 管理員

Headers: X-Idempotency-Key（防重複）

請求:

json
{ "member_package_id": "uuid", "selected_service_ids": [1, 2], "signature_url": "data:image/png;base64,..." }
POST /admin/member-packages/adjust — 調整次數
權限: 管理員

請求:

json
{ "member_package_id": "uuid", "delta": 2, "reason": "客訴補償" }
GET /admin/member-packages/packages — 查詢客戶組合包
權限: 管理員

查詢參數: customer_id

GET /admin/member-packages/my/packages/used — 客戶查詢已用完的組合包
權限: 客戶

使用記錄 (Service Logs)
GET /service-logs — 使用記錄列表（統合傳統+組合包+贈品）
權限: 登入

查詢參數: customer_id, customer_name, page, limit

POST /service-logs — 建立使用記錄（傳統服務）
權限: 管理員/員工

Headers: X-Idempotency-Key

請求: FormData（含 signature file）

PATCH /service-logs/:id/notes — 編輯備註
權限: 管理員/員工

請求:

json
{ "notes": "客戶要求溫和操作" }
調整記錄 (Adjustments)
GET /adjustments — 調整記錄列表
權限: 登入

查詢參數: customer_name, adjustment_type, page, limit

POST /adjustments — 建立調整記錄
權限: 管理員

請求:

json
{ "member_service_id": 10, "adjustment_type": "INCREASE", "amount": 2, "reason": "客訴補償" }
儀表板 (Dashboard)
GET /admin/stats — 儀表板統計
權限: 管理員

回應:

json
{ "totalMembers": 128, "totalUsage": 80, "dailyUsage": [...], "recentLogs": [...] }
客戶端 API
GET /public/my/service-packages — 我的療程包
權限: 客戶

GET /public/my/usage-logs — 我的使用記錄
權限: 客戶

GET /member-services/customers/me/member-services — 我的傳統服務包
權限: 客戶

GET /member-services/customers/me/member-services/used — 已用完的傳統服務包
權限: 客戶