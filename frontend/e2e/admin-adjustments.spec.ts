import { test, expect } from '@playwright/test';

test.describe('人工補償', () => {
  test('可查詢調整記錄', async ({ page }) => {
    // Mock 調整記錄 API
    await page.route('**/api/adjustments*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: 1,
                adjustment_type: 'INCREASE',
                amount: 2,
                reason: '客訴補償',
                created_at: '2026-05-02T10:00:00Z',
                customer: { name: '王美美' },
                member_service_id: null,
                member_package_id: 'mp-1',
                package_snapshot_name: '美白組',
              },
            ],
            total: 1,
          },
        }),
      });
    });

    // 登入
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // 導向調整記錄頁面
    await page.goto('/admin/adjustments');
    await page.waitForTimeout(1000); // 等待 SPA 渲染

    // 驗證標題
    await expect(page.locator('h1')).toHaveText('人工補償記錄');
    await expect(page.locator('.record-card')).toHaveCount(1);
    await expect(page.locator('text=客訴補償')).toBeVisible();
  });
});