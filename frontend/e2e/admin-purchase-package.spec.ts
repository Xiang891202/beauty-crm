import { test, expect } from '@playwright/test';

test.describe('購買組合包', () => {
  test('管理員可以為客戶購買組合包', async ({ page }) => {
    // === Mock 登入 ===
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { token: 'test-token', user: { id: 1, role: 'admin' } },
        }),
      });
    });
    // === Mock 會員列表 ===
    await page.route('**/api/members*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 1, name: '王美美', phone: '0912345678' }],
        }),
      });
    });
    // === Mock 組合包列表 ===
    await page.route('**/api/service-packages/packages*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 'pkg-1', name: '美白組', price: 2000, items: [{ service: { name: '臉部保濕' }, quantity: 2 }] }],
        }),
      });
    });
    // === Mock 購買組合包 ===
    await page.route('**/api/admin/member-packages/purchase', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'mp-1', remaining_uses: 5 } }),
      });
    });

    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    await page.goto('/admin/member-packages/purchase?customer_id=1');
    await page.waitForTimeout(500);
    await page.selectOption('select:first-of-type', '1');
    const allSelects = page.locator('select');
    await allSelects.nth(1).selectOption('pkg-1');
    await page.fill('input[type="number"]', '5');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin\/members\/1/);
  });
});