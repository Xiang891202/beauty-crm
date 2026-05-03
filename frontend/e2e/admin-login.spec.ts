import { test, expect } from '@playwright/test';

test.describe('管理員後台', () => {
  test('應能成功登入並看到儀表板', async ({ page }) => {
    // === Mock 登入 API ===
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@gmail.com', role: 'admin' },
          },
        }),
      });
    });

    // === Mock 儀表板統計 API ===
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

    await page.goto('/admin/login');
    await expect(page.locator('h2')).toHaveText('管理員登入');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin\/dashboard/);
    await page.waitForTimeout(500);

    await expect(page.locator('.stats-cards')).toBeVisible();
    await expect(page.locator('text=總會員數')).toBeVisible();
  });

  test('錯誤帳密應顯示錯誤訊息', async ({ page }) => {
    // 不攔截，讓請求自然失敗（CI 中無後端，axios 攔截器會顯示錯誤）
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
  });
});