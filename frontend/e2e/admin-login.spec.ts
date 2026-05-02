import { test, expect } from '@playwright/test';

test.describe('管理員後台', () => {
  test('應能成功登入並看到儀表板', async ({ page }) => {
    // 攔截儀表板統計 API，直接回傳假資料
    await page.route('**/api/admin/stats*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalMembers: 128,
            totalUsage: 80,
            dailyUsage: [
              { date: '2026-05-01', count: 5 },
              { date: '2026-05-02', count: 8 },
            ],
            recentLogs: [
              {
                id: 1,
                memberName: '王美美',
                serviceName: '臉部保濕',
                usedAt: '2026-05-02T10:00:00',
                note: null,
                signatureImage: null,
              },
            ],
          },
        }),
      });
    });

    // 1. 前往登入頁
    await page.goto('/admin/login');
    await expect(page.locator('h2')).toHaveText('管理員登入');

    // 2. 輸入帳號密碼
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');

    // 3. 點擊登入
    await page.click('button[type="submit"]');

    // 4. 驗證跳轉
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 5. 等待數據渲染
    await page.waitForTimeout(1000);

    // 6. 確認統計卡片
    await expect(page.locator('.stats-cards')).toBeVisible();
    await expect(page.locator('text=總會員數')).toBeVisible();
    await expect(page.locator('text=128')).toBeVisible();
  });

  test('錯誤帳密應顯示錯誤訊息', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toBeVisible();
  });
});