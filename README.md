# 💄 Beauty CRM

美容產業客戶關係管理系統，提供客戶管理、服務項目、組合套餐購買與使用扣次、簽名板、後台儀表板等功能，**已完整支援多租戶（Multi-Tenant）隔離架構**。

## 技術棧

### 後端 (Backend)
- **Express.js** + **TypeScript**
- **Prisma** – 資料庫 ORM (PostgreSQL)
- **Supabase** – 儲存簽名圖片與部分資料表
- **JWT** – 身份驗證與權限控制
- **Multer** – 檔案上傳
- **Joi** – 請求驗證
- **Jest** – 單元／整合測試
- **冪等性 (Idempotency)** – 防止重複扣次

### 前端 (Frontend)
- **Vue 3** + **TypeScript**
- **Pinia** – 狀態管理
- **Vue Router**
- **Axios**
- **Vitest** – 單元測試
- **Playwright** – 端對端 (E2E) 測試

---

## 多租戶架構（Multi-Tenant）

所有業務資料表均包含 `tenant_id` 欄位，透過 **`tenantContext` 中介層** 自動注入當前請求的租戶 ID，達到不同商家資料完全隔離。

- **管理員 (admin)**：不受租戶限制，可跨商家操作（`tenantContext` 自動豁免）。
- **一般後台使用者**：從 `users` 表取得 `tenant_id`。
- **客戶 (customer)**：從 `customers` 表取得 `tenant_id`。
- **環境變數 `MULTI_TENANT`**：設為 `true` 時啟用租戶隔離；`false` 則完全略過（單一租戶模式）。
- **`tenants` 表**：僅存在於特定環境，由開發者手動管理，Prisma 設為 `@@ignore` 不會被更動。

> ⚠️ 分層後所有 API 請求都必須先經過 `authenticate`（JWT 驗證）再進入 `tenantContext`，順序已在路由統一處理，避免因中間件順序錯誤導致 401。

---

## 測試（Testing）

> 本專案已建立完整的「測試金字塔」，共 **126 個自動化測試案例**，涵蓋單元、整合、端對端測試，確保商業邏輯正確性與系統穩定性。

### 為什麼要測試？
- **商轉系統不容出錯**：任何一次更新都可能破壞扣次、調整、組合包購買等核心流程，自動化測試能在幾分鐘內驗證所有功能。
- **回歸保護**：每次修改程式碼後，執行全部測試即可立即知道是否影響既有功能，無須手動重測。
- **文件化邏輯**：測試本身就是活文件，描述每個模組的預期行為，方便團隊接手與維護。
- **縮短開發回饋迴圈**：開發時可先透過單元測試驗證邏輯，再進行整合測試，最後由 E2E 模擬真實使用者操作，提早發現問題。

### 測試架構與指令

| 層級 | 框架 | 測試對象 | 執行指令 | 測試數量 |
|------|------|----------|----------|----------|
| 後端單元測試 | Jest | Services, Middleware, Validators, Utils | `cd backend && npx jest --config jest.config.js` | 70 |
| 後端整合測試 | Jest + Supertest | 完整 HTTP 請求流程 (路由、權限、控制器) | `cd backend && npm run test:integration` | 13 |
| 前端單元測試 | Vitest + Vue Test Utils | Composables, Store, Components, API 模組, Utils, Router Guards | `cd frontend && npm test` | 35 |
| 前端 E2E 測試 | Playwright | 真實瀏覽器操作完整使用者流程 | `cd frontend && npx playwright test` | 8 |

**一次執行所有測試（後端 + 前端）：**
```bash
# 在 backend 目錄
npm run test:all

# 在 frontend 目錄 (PowerShell)
npm test; npx playwright test
CI/CD 自動化測試
已整合 GitHub Actions，每次 push 到 main 或發送 Pull Request 時會自動執行後端測試 + 前端單元測試 + E2E 測試，確保每次更新安全。
工作流程檔案：.github/workflows/test.yml

測試涵蓋範圍
後端單元測試摘要
測試模組	案例數	重點驗證
會員管理	4	CRUD、手機重複、生日格式容錯
服務項目	4	建立、名稱重複、含已刪除查詢
組合包定義	2	建立、軟刪除
會員套餐管理	8	購買、累加、扣次、次數不足、簽名必填、人工調整、防止負數
服務使用記錄	10	扣次、授權不存在、次數不足、FIFO、統合列表
調整記錄	4	增加、減少不低於 0、列表過濾與分頁
統計儀表板	2	數據加總、無資料時不報錯
認證	3	登入成功、密碼錯誤、客戶驗證
會員服務配額	2	建立、不存在報錯
產品管理	1	查詢所有產品
簽名上傳	1	上傳成功回傳網址
Middleware	7	auth, admin, validate, upload
Validators	7	service_log, adjustment
Utils	5	JWT, response, upload
前端單元測試摘要
測試模組	案例數	重點驗證
Composables (useIdleTimeout)	3	閒置逾時對話框、token 控管、繼續使用重置計時
Store (auth.store)	4	登入後 token/user 寫入 localStorage、登出清除、isLoggedIn getter
Components (SignaturePad)	6	灰色觸發區、模態框渲染、清除、未簽名 alert、已簽名 save 事件、取消關閉
API 模組 (memberPackage, adjustment)	8	POST/GET 請求參數、回傳值解構
Utils (format)	3	日期、日期時間、貨幣格式化
Router 守衛	5	未登入重導向、角色不符拒絕、已登入跳過登入頁
Components (Login, UsageList)	6	登入表單、使用紀錄列表渲染
前端 E2E 測試摘要
測試場景	驗證重點
管理員成功登入並查看儀表板	Token 儲存、API mock、統計卡片渲染
錯誤帳密顯示錯誤訊息	表單驗證、錯誤 class 出現
管理員為客戶購買組合包	選擇客戶/組合包、填寫表單、alert 處理、頁面跳轉
管理員幫會員使用服務（扣次）	模態框互動、選擇組合包、勾選服務、滿版簽名路由
客戶登入後查看療程包	客戶端登入、療程包列表渲染
人工補償記錄查詢	篩選、列表正確顯示卡片
傳統服務購買與使用	購買模態框、驗證下拉選單出現新方案、滿版簽名路由、modal 關閉驗證
會員新增與編輯 (CRUD)	表單填寫與驗證、模態框開關、提交後列表刷新、alert 驗證
核心功能
管理員端
會員管理（CRUD）

課程管理（CRUD + 軟刪除）

組合包管理（CRUD + 下架/恢復）

購買組合包（含總次數設定）

使用服務扣次（傳統服務 + 組合包）

滿版簽名路由（直立自動轉橫式）

人工補償記錄（調整次數）

使用紀錄總覽（含備註編輯）

儀表板統計

贈品管理

多租戶隔離（自動根據登入者取得所屬商家資料）

客戶端
手機號碼 + 密碼登入

查看療程包（只顯示有剩餘次數的，並自動限縮於所屬 tenant）

查看使用紀錄（含簽名圖片）

歷史購買頁面（已用完的傳統服務包 + 組合包，含品項明細）

聯絡我們（LINE 連結直達聊天室）

安全性
多租戶資料隔離（tenantContext 中介層）

冪等性防重複扣次（Idempotency Key）

JWT 身份驗證與角色權限控制

輸入驗證（Joi）

簽名圖片上傳 Supabase Storage（組合包自動轉 URL）

middleware 執行順序嚴格控管（authenticate → tenantContext → roleMiddleware）

快速開始
1. 環境需求
Node.js >= 18

PostgreSQL 資料庫

Supabase 帳號與專案（用於圖片儲存）

2. 環境變數設定
專案支援多環境（如 personal、customer），每個環境有自己的 .env 檔案（如 .env.personal、.env.customer）。
範例 .env.personal：

env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="anon-key"
SUPABASE_SERVICE_KEY="service-key"
SUPABASE_BUCKET="signatures"
PORT=5001
MULTI_TENANT=true   # 啟用多租戶隔離

⚠️ .env.* 皆已加入 .gitignore，不會被提交。

3. 安裝相依套件
bash
cd backend
npm install
4. 資料庫遷移
bash
# 針對特定環境同步 Schema
npx dotenv -e .env.personal -- npx prisma db push
5. 建立冪等性記錄表
在 Supabase SQL Editor 中執行：

sql
CREATE TABLE IF NOT EXISTS idempotency_records (
  key VARCHAR(255) PRIMARY KEY,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
6. 啟動後端伺服器
bash
# personal 環境
npm run dev:personal
# customer 環境
npm run dev:customer
伺服器會依據環境變數啟動於對應埠（預設 5001 / 5000）。

7. 前端（獨立執行）
bash
cd ../frontend
npm install
npm run dev:personal
目錄結構
text
beauty-crm/
├── frontend/                 # Vue 3 前端（客戶展示 + 後台管理）
│   ├── src/
│   │   ├── views/
│   │   │   ├── public/       # 客戶端頁面（免登入）
│   │   │   └── admin/        # 後台頁面
│   │   ├── components/       # 共用元件（簽名板、按鈕…）
│   │   ├── stores/           # Pinia 狀態管理
│   │   ├── api/              # API 呼叫封裝
│   │   └── router/           # 路由設定
│   └── ...
├── backend/                  # Express API 伺服器
│   ├── src/
│   │   ├── config/           # 環境變數、Prisma、Supabase、儲存桶
│   │   ├── routes/           # 路由定義 (已加入多租戶 middleware 組合)
│   │   ├── controllers/      # 請求處理
│   │   ├── services/         # 商業邏輯
│   │   ├── repositories/     # 資料存取層
│   │   ├── middleware/       # authenticate, tenantContext, role, upload, error…
│   │   ├── validators/       # Joi 輸入驗證
│   │   ├── utils/            # JWT、回應格式、圖片上傳
│   │   └── types/            # TypeScript 型別定義
│   ├── __tests__/            # 測試
│   │   ├── unit/             # 單元測試
│   │   └── integration/      # 整合測試
│   └── ...
└── docs/                     # 文件（API 文件、ERD）

doc文件:
ERD.md：所有資料表結構與關聯

api-spec.md：完整 API 規格（含權限、請求/回應格式）

flow.md：管理員與客戶的業務操作流程


API 概覽
路徑	方法	說明	權限
/api/auth/login	POST	管理員登入	公開
/api/auth/profile	GET	取得當前使用者資訊	登入
/api/members	GET	會員列表（依 tenant 過濾）	登入
/api/members	POST	新增會員（自動帶入 tenant_id）	管理員
/api/services	GET	服務列表
/api/service-packages	GET	組合包列表（依 tenant 過濾）	登入
/api/admin/member-packages/purchase	POST	為客戶購買組合包	管理員
/api/admin/member-packages/use	POST	使用服務（扣次）	管理員
/api/admin/member-packages/adjust	POST	調整剩餘次數	管理員
/api/admin/member-packages/my/packages/used	GET	客戶查詢已用完的組合包	客戶
/api/service-logs	GET	使用記錄（統合傳統與組合包）	登入
/api/service-logs/:id/notes	PATCH	編輯備註	管理員
/api/adjustments	GET	調整記錄列表	登入
/api/admin/stats	GET	儀表板統計（自動依 tenant 彙總）	管理員
/api/public/auth/customer/login	POST	客戶登入	公開
/api/member-services/customers/me/member-services/used	GET	客戶查詢已用完的傳統服務包	客戶
…	…	…	…

> 所有受保護路由均經過 `authenticate` → `tenantContext` → 控制器，確保資料隔離與安全性。

未來計畫
前端單元測試（Vitest + Vue Test Utils）

E2E 測試（Playwright）

CI/CD 自動化測試流程 (GitHub Actions)

簽名板滿版模式（含組合包與傳統服務、直立自動轉橫式）

管理員使用紀錄備註編輯

組合包簽名改存 URL（Supabase Storage）

冪等性防重複扣次（Idempotency Key）

客戶端療程包過濾（只顯示有剩餘次數）

客戶端歷史購買頁面（含品項明細）

套餐過期自動判斷

併發扣次防超扣

客戶端自助查詢與使用服務

後端圖片壓縮（減少雲端儲存空間）

輕量 DTO（後台 API 回應瘦身）

CDN 加速（Vercel 部署）

授權
本專案為商業用途，未經授權不得任意散佈。