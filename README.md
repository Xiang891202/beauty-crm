markdown
# 💄 Beauty CRM

美容產業客戶關係管理系統，提供客戶管理、服務項目、組合套餐購買與使用扣次、簽名板、後台儀表板等功能。

## 技術棧

### 後端 (Backend)
- **Express.js** + **TypeScript**
- **Prisma** – 資料庫 ORM (PostgreSQL)
- **Supabase** – 儲存簽名圖片與部分資料表
- **JWT** – 身份驗證與權限控制
- **Multer** – 檔案上傳
- **Joi** – 請求驗證
- **Jest** – 單元／整合測試

### 前端 (Frontend)
- **Vue 3** + **TypeScript**
- **Pinia** – 狀態管理
- **Vue Router**
- **Axios**
- **Vitest** – 前端測試（規劃中）

## 目錄結構
beauty-crm/
├── frontend/ # Vue 3 前端（客戶展示 + 後台管理）
│ ├── src/
│ │ ├── views/
│ │ │ ├── public/ # 客戶端頁面（免登入）
│ │ │ └── admin/ # 後台頁面
│ │ ├── components/ # 共用元件（簽名板、按鈕…）
│ │ ├── stores/ # Pinia 狀態管理
│ │ ├── api/ # API 呼叫封裝
│ │ └── router/ # 路由設定
│ └── ...
├── backend/ # Express API 伺服器
│ ├── src/
│ │ ├── config/ # 環境變數、Prisma、Supabase、儲存桶
│ │ ├── routes/ # 路由定義
│ │ ├── controllers/ # 請求處理
│ │ ├── services/ # 商業邏輯
│ │ ├── repositories/ # 資料存取層
│ │ ├── middleware/ # 驗證、權限、上傳、錯誤處理
│ │ ├── validators/ # Joi 輸入驗證
│ │ ├── utils/ # 工具函數（JWT、回應格式、圖片上傳）
│ │ └── types/ # TypeScript 型別定義
│ ├── tests/ # 測試
│ │ ├── unit/ # 單元測試（services, middleware, validators, utils）
│ │ └── integration/ # 整合測試（routes）
│ └── ...
└── docs/ # 文件（API 文件、ERD）

text

## 快速開始

### 1. 環境需求
- Node.js >= 18
- PostgreSQL 資料庫
- Supabase 帳號與專案（用於圖片儲存）

### 2. 環境變數設定
在 `backend/` 下建立 `.env` 檔案（可參考 `.env.example`）：

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="anon-key"
SUPABASE_SERVICE_KEY="service-key"
SUPABASE_BUCKET="signatures"
PORT=3000
3. 安裝相依套件
bash
cd backend
npm install
4. 資料庫遷移
bash
npx prisma migrate dev
5. 啟動後端伺服器
bash
npm run dev
伺服器會啟動於 http://localhost:3000。

6. 前端（獨立執行）
bash
cd ../frontend
npm install
npm run dev
測試
專案包含完整的單元測試與整合測試。

bash
# 執行所有單元測試
npm test

# 執行整合測試（需要先啟動伺服器或使用 mock）
npm run test:integration

# 一次執行全部測試
npm run test:all
測試涵蓋：

後端單元測試摘要
1. 會員管理 (member.service.test.ts)
測試名稱	測試內容	驗證重點
新增會員，密碼會經 bcrypt hash	呼叫 addMember 並傳入密碼	成功建立會員，回傳的 id 為 1
手機重複時 modifyMember 會報錯	模擬存在相同電話號碼時更新	拋出錯誤「此電話號碼已被其他會員使用」
傳入無效日期字串時不崩潰	以 'not-a-date' 更新生日	modifyMember 不拋出未預期錯誤
回傳不含密碼的會員列表	呼叫 getAllMembersForAdmin	回傳陣列且元素不含 password_hash

2. 服務項目 (service.service.test.ts)
測試名稱	測試內容	驗證重點
建立服務項目	呼叫 createService	回傳物件名稱正確
名稱重複報錯	建立時模擬已有同名服務	拋出錯誤「服務名稱已存在」
查詢所有服務（不含已刪除）	呼叫 getServices(false)	回傳陣列
查詢所有服務（含已刪除）	呼叫 getServices(true)	回傳陣列（驗證 repository 被正確呼叫）

3. 組合包（套餐）定義 (service-package.service.test.ts)
測試名稱	測試內容	驗證重點
建立組合包，寫入主表與品項	呼叫 createPackage 含多個服務品項	回傳物件 id 不為空
軟刪除組合包	呼叫 deletePackage	無拋錯，功能正常

4. 會員套餐管理 (member-package.service.test.ts)
測試名稱	測試內容	驗證重點
購買成功並設定到期日	模擬購買套餐	回傳物件 id 及 expiryDate 正確
重複購買累加剩餘次數	相同套餐再次購買	剩餘次數正確累加
使用服務（扣減總次數）成功	呼叫 useService 並選擇多個服務	回傳使用記錄 id，且剩餘次數正確更新
剩餘次數不足時拋錯	套餐剩餘次數為 0 時嘗試使用	拋出「剩餘次數不足」錯誤
簽名為空時拋錯	不提供簽名資料	拋出「簽名為必填項目」錯誤
人工增加次數（adjust）	呼叫 adjustRemaining 增加次數	回傳 new_remaining 正確增加
人工扣減後不得小於 0	扣減數量超過剩餘次數	拋出「剩餘次數不能為負數」錯誤
（Skip） 套餐已過期時應拒絕使用	使用已過期的套餐	（待實作過期檢查後啟用）預期拋出「套餐已過期」

5. 服務使用記錄 (service_log.service.test.ts)
測試名稱	測試內容	驗證重點
無 member_service_id 時直接建立記錄	創建不綁定套餐的使用記錄	直接呼叫 repository，不執行扣次邏輯
擁有足夠次數時扣減並建立記錄	提供有效的 member_service_id，且剩餘次數 > 0	在 transaction 中建立記錄並更新剩餘次數
授權不存在時報錯	提供的 member_service_id 查無資料	拋出「找不到該服務授權」
次數不足時拋出 InsufficientQuotaError	剩餘次數為 0	拋出特定錯誤型別
查詢單筆記錄成功	呼叫 getById	回傳對應記錄
記錄不存在時報錯	查詢不存在的 id	拋出「Service log not found」
更新備註	呼叫 updateNotes	正確傳遞參數給 repository
更新簽名	呼叫 updateSignature	正確傳遞參數給 repository
合併傳統與組合包使用列表	呼叫 getUnifiedList 並模擬兩類資料	回傳合併後的列表，總數計算正確
客戶名稱搜尋無結果時提前返回空	提供不存在的客戶名稱	回傳 items 為空陣列

6. 調整記錄 (adjustment.service.test.ts)
測試名稱	測試內容	驗證重點
增加次數並建立調整記錄	呼叫 createAdjustment 類型為 INCREASE	正確建立記錄，類型為 INCREASE
減少次數不得低於 0	減少後剩餘次數為負	拋出「Cannot decrease below zero」
支援依調整類型與日期過濾，正確分頁	呼叫 list 並傳入過濾參數	回傳正確的資料量，並驗證 supabase 查詢鏈
查無資料時回傳空陣列	無符合條件的資料	items 為空陣列

7. 統計儀表板 (stats.service.test.ts)
測試名稱	測試內容	驗證重點
回傳儀表板統計	模擬存在會員、使用紀錄和組合包記錄	總會員數、總使用次數、近期記錄正確
無任何使用紀錄時不應報錯	所有資料均為 0 或空	總計為 0，dailyUsage 長度為 7 天，不拋錯

8. 認證 (auth.service.test.ts)
測試名稱	測試內容	驗證重點
登入成功回傳 token	使用正確的 email 和密碼	回傳物件包含 token
密碼錯誤拋錯	提供錯誤密碼	拋出「Invalid credentials」
客戶驗證成功回傳客戶資料（不含密碼）	呼叫 AuthService.validateCustomer	回傳物件不包含 password_hash

9. 會員服務配額 (member_service.service.test.ts)
測試名稱	測試內容	驗證重點
建立客戶服務授權	呼叫 createMemberService	回傳物件的 total_sessions 正確
查詢不存在的授權報錯	呼叫 getMemberServiceById 查詢無效 id	拋出「服務配額不存在」

10. 產品管理 (product.service.test.ts)
測試名稱	測試內容	驗證重點
查詢所有產品	呼叫 getAllProducts	回傳陣列並有產品名稱

11. 簽名上傳 (signature.service.test.ts)
測試名稱	測試內容	驗證重點
上傳成功回傳公開網址	模擬檔案上傳	回傳網址以 https://mock.supabase.co/fake-url 結尾

12. Middleware
測試名稱	測試內容	驗證重點
authMiddleware		
無 Authorization header → 401	請求未帶 token	回傳 401 且 next 未被呼叫
token 驗證失敗 → 401	token 無法被 jwt.verify 解析	回傳 401
token 合法 → 設定 req.user 並呼叫 next	提供合法 token	req.user 等於解碼後的 payload，next 被呼叫
requireAdmin		
無 user → 403	req.user 不存在	回傳 403
非 admin 且 is_admin 非 true → 403	user role = 'staff'	回傳 403
role 為 admin → 放行	role = 'admin'	next 被呼叫
is_admin 為 true → 放行	user.is_admin = true	next 被呼叫
validate middleware		
資料符合 Joi schema → 呼叫 next	提供正確的 body	next 被呼叫
資料不符合 schema → 回傳 400	提供錯誤型別的欄位	回傳正確的 errorResponse 格式
可驗證 query 參數	指定 part = 'query'	正確驗證 query 字串
upload middleware		
multer middleware 應為 function	驗證 upload.single() 回傳型別	回傳 function
有檔案時呼叫 next 且無錯誤	模擬 req.file 存在	next 被呼叫且無參數
無檔案時傳遞錯誤給 next	req.file 為 undefined	next 被呼叫並帶有 Error 物件

13. Validators
測試名稱	測試內容	驗證重點
createUsageSchema		
合法資料通過	提供所有必填欄位	驗證 error 為 undefined
缺少必填 member_service_id 失敗	缺少該欄位	驗證 error 存在
customer_id 為字串失敗	提供非數字	驗證 error 存在
createAdjustmentSchema		
合法增加調整通過	提供 member_service_id、INCREASE、amount、reason	通過驗證
至少需要 customer_id 或 member_service_id	二者皆無	驗證失敗
amount 為 0 失敗	amount = 0	驗證失敗
adjustment_type 錯誤失敗	使用 'ADD' 而非 'INCREASE'	驗證失敗

14. Utils
測試名稱	測試內容	驗證重點
JWT		
生成 token 並驗證解出 payload	使用 jwt.sign 和 jwt.verify	回傳的 payload 與原始相同
過期 token 拋出 TokenExpiredError	簽發 1ms 過期的 token	驗證後拋出 jwt.TokenExpiredError
錯誤 secret 驗證失敗	用錯誤 secret 驗證	拋出 jwt.JsonWebTokenError
Response Helpers		
successResponse 格式正確	傳入 { id: 1 }	回傳 { success: true, data: { id: 1 } }
errorResponse 格式正確	傳入訊息與狀態碼	回傳 { success: false, error: ..., status: ... }
Upload Utils		
uploadImage 被呼叫並回傳模擬網址	呼叫 mock 後的函數	回傳指定 URL
deleteImage 傳入正確的檔案名稱	呼叫 mock 後的函數	函數被呼叫且參數正確
註： 測試總數 71 個測試案例，其中 1 個暫跳過（套餐過期判斷），其餘全部通過。



API 概覽
路徑	方法	說明	權限
/api/auth/login	POST	管理員登入	公開
/api/auth/profile	GET	取得當前使用者資訊	登入
/api/members	GET	會員列表	公開
/api/members	POST	新增會員	管理員
/api/services	GET	服務列表	公開
/api/service-packages	GET	組合包列表	登入
/api/admin/member-packages/purchase	POST	為客戶購買組合包	管理員
/api/admin/member-packages/use	POST	使用服務（扣次）	管理員
/api/admin/member-packages/adjust	POST	調整剩餘次數	管理員
/api/service-logs	GET	使用記錄（統合傳統與組合包）	登入
/api/adjustments	GET	調整記錄列表	登入
/api/admin/stats	GET	儀表板統計	管理員
/api/public/auth/customer/login	POST	客戶登入	公開
…	…	…	…
完整 API 文件請參考 docs/ 資料夾。

未來計畫
前端測試（Vitest + Vue Test Utils）

E2E 測試（Cypress）

套餐過期自動判斷

併發扣次防超扣

客戶端自助查詢與使用服務

授權
本專案為商業用途，未經授權不得任意散佈。