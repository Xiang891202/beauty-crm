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
- **Vitest** – 單元測試
- **Playwright** – 端對端 (E2E) 測試

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

# 在 frontend 目錄
npm test && npx playwright test
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
快速開始
1. 環境需求
Node.js >= 18

PostgreSQL 資料庫

Supabase 帳號與專案（用於圖片儲存）

2. 環境變數設定
在 backend/ 下建立 .env 檔案（可參考 .env.example）：

env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="anon-key"
SUPABASE_SERVICE_KEY="service-key"
SUPABASE_BUCKET="signatures"
PORT=5001
3. 安裝相依套件
bash
cd backend
npm install
4. 資料庫遷移
bash
npx prisma migrate dev
5. 啟動後端伺服器
bash
npm run dev:personal
伺服器會啟動於 http://localhost:5001。

6. 前端（獨立執行）
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
│   │   ├── routes/           # 路由定義
│   │   ├── controllers/      # 請求處理
│   │   ├── services/         # 商業邏輯
│   │   ├── repositories/     # 資料存取層
│   │   ├── middleware/       # 驗證、權限、上傳、錯誤處理
│   │   ├── validators/       # Joi 輸入驗證
│   │   ├── utils/            # 工具函數（JWT、回應格式、圖片上傳）
│   │   └── types/            # TypeScript 型別定義
│   ├── __tests__/            # 測試
│   │   ├── unit/             # 單元測試（services, middleware, validators, utils）
│   │   └── integration/      # 整合測試（routes）
│   └── ...
└── docs/                     # 文件（API 文件、ERD）
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
前端單元測試（Vitest + Vue Test Utils）

E2E 測試（Playwright）

CI/CD 自動化測試流程 (GitHub Actions)

簽名板滿版模式（含組合包與傳統服務）

套餐過期自動判斷

併發扣次防超扣

客戶端自助查詢與使用服務

管理員備註流程優化（簽名後一併送出、扣次、記錄）

後端圖片壓縮（減少雲端儲存空間）

授權
本專案為商業用途，未經授權不得任意散佈。