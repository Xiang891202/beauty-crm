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
      if (route.request().method() === 'GET') {
        // 列表 or 單一會員
        if (route.request().url().includes('/members/1') && !route.request().url().includes('services')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: 1, name: '王美美', phone: '0912345678' },
            }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [{ id: 1, name: '王美美', phone: '0912345678' }],
            }),
          });
        }
      } else {
        route.continue();
      }
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
    // === Mock 會員服務列表 (詳情頁用) ===
    await page.route('**/api/members/*/services', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    // === Mock 客戶組合包列表 (詳情頁用) ===
    await page.route('**/api/admin/member-packages/packages*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // 登入
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // 前往購買頁面
    await page.goto('/admin/member-packages/purchase?customer_id=1');
    await page.waitForTimeout(500);

    // 選擇客戶
    await page.selectOption('select:first-of-type', '1');
    // 選擇組合包
    const allSelects = page.locator('select');
    await allSelects.nth(1).selectOption('pkg-1');
    // 輸入總次數
    await page.fill('input[type="number"]', '5');

    // 使用 Promise.all 確保點擊與 dialog 事件同步
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog', { timeout: 5000 }),
      page.click('button[type="submit"]')
    ]);
    expect(dialog.message()).toContain('購買成功');
    await dialog.accept();

    // 等待路由跳轉到會員詳情頁
    await page.waitForURL(/\/admin\/members\/1/, { timeout: 10000 });
  });
});