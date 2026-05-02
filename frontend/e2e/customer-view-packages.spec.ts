import { test, expect } from '@playwright/test';

test.describe('客戶端', () => {
  test('客戶登入後可查看療程包', async ({ page }) => {
    // 攔截客戶登入 API
    await page.route('**/api/auth/customer/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'cust-token',
            user: { id: 2, phone: '0911111111', role: 'customer' },
          },
        }),
      });
    });

    // Mock 我的療程包 API
    await page.route('**/api/public/my/service-packages', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'mp-1',
              snapshot_name: '美白組',
              remaining_uses: 3,
              purchase_date: '2026-05-01',
              snapshot_items: [{ service_id: 1, service: { name: '臉部保濕' } }],
            },
          ],
        }),
      });
    });

    await page.goto('/customer/login');
    await page.fill('input[placeholder="0912345678"]', '0911111111');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("登入")');

    await expect(page).toHaveURL(/\/my-services/);
    await expect(page.locator('h2')).toHaveText('我的服務');
    await expect(page.locator('text=美白組')).toBeVisible();
    await expect(page.locator('text=剩餘總次數：3')).toBeVisible();
  });
});