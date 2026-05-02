import { test, expect } from '@playwright/test';

test.describe('購買組合包', () => {
  test('管理員可以為客戶購買組合包', async ({ page }) => {
    // Mock 會員列表
    await page.route('**/api/members*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: '王美美', phone: '0912345678' },
          ],
        }),
      });
    });

    // Mock 組合包列表
    await page.route('**/api/service-packages/packages*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'pkg-1', name: '美白組', price: 2000, items: [{ service: { name: '臉部保濕' }, quantity: 2 }] },
          ],
        }),
      });
    });

    // Mock 購買 API
    await page.route('**/api/admin/member-packages/purchase', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 'mp-1', remaining_uses: 5 },
        }),
      });
    });

    // 登入
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // 前往購買組合包頁面
    await page.goto('/admin/member-packages/purchase?customer_id=1');
    await page.waitForTimeout(500);

    // 選擇客戶 (第一個 select)
    await page.selectOption('select:first-of-type', '1');
    // 選擇組合包 (第二個 select)
    const allSelects = page.locator('select');
    await allSelects.nth(1).selectOption('pkg-1');
    // 輸入總次數
    await page.fill('input[type="number"]', '5');
    // 點擊確認購買
    await page.click('button[type="submit"]');

    // 驗證跳轉到會員詳情頁（購買成功後會 push 到 /admin/members/:id）
    await expect(page).toHaveURL(/\/admin\/members\/1/);
  });
});