import { test, expect } from '@playwright/test';

test.describe('使用組合包服務', () => {
  test('管理員可以幫會員使用服務並扣次', async ({ page }) => {
    // === Mock 登入與 profile ===
    await page.route('**/api/auth/login', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { token: 'test-token', user: { id: 1, role: 'admin' } } }),
    }));
    await page.route('**/api/auth/profile', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, email: 'test@gmail.com', role: 'admin' } }),
    }));

    // === Mock 會員詳情 ===
    await page.route('**/api/members/1', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, name: '王美美', phone: '0912345678' } }),
    }));

    // === Mock 客戶組合包列表 ===
    await page.route('**/api/admin/member-packages/packages?customer_id=1', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{
          id: 'mp-1',
          snapshot_name: '美白組',
          remaining_uses: 5,
          snapshot_items: [
            { service_id: 1, service: { name: '臉部保濕' } },
            { service_id: 2, service: { name: '去角質' } },
          ],
        }],
      }),
    }));

    // === Mock 扣次 ===
    await page.route('**/api/admin/member-packages/use', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 'log-1' } }),
    }));

    // 登入並前往會員詳情
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    await page.goto('/admin/members/1');
    await page.waitForTimeout(500);

    // 點擊「使用組合包」按鈕
    await page.getByText('使用組合包').first().click();
    await page.waitForTimeout(500);

    // 選擇組合包
    const selects = page.locator('select');
    await selects.first().selectOption('mp-1');

    // 勾選服務項目
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // 點擊灰色簽名觸發區 → 應導航到滿版簽名頁
    const signatureTrigger = page.locator('.signature-trigger');
    await signatureTrigger.click();
    await page.waitForURL('**/admin/signature');

    // 在滿版 canvas 上繪製簽名
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x - 50, y - 10);
      await page.mouse.down();
      await page.mouse.move(x + 50, y + 10, { steps: 10 });
      await page.mouse.up();
    }

    // 點擊「確認」按鈕
    await page.click('button:has-text("確認")');
    // 返回會員詳情頁（模態框應重新出現，並顯示簽名預覽）
    await page.waitForURL('**/admin/members/1');
    await page.waitForTimeout(300);

    // 確認簽名預覽圖片出現
    await expect(page.locator('.signature-preview')).toBeVisible();
  });
});