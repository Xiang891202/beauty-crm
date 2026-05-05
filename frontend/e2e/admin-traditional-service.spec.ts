import { test, expect } from '@playwright/test';

test.describe('傳統服務購買與使用', () => {
  test('管理員可以為會員購買傳統服務，並使用該服務', async ({ page }) => {

    // === Mock 登入與 profile ===
    await page.route('**/api/auth/login', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { token: 'test-token', user: { id: 1, role: 'admin' } } }),
    }));
    await page.route('**/api/auth/profile', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, email: 'test@gmail.com', role: 'admin' } }),
    }));

    // === 會員詳情 ===
    await page.route('**/api/members/1', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, name: '王美美', phone: '0912345678' } }),
    }));

    // === 服務列表 ===
    await page.route('**/api/services*', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ id: 1, name: '臉部保濕', price: 800 }] }),
    }));

    // === 購買傳統服務 ===
    await page.route('**/api/member-services', (route) => route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 10, customer_id: 1, service_id: 1, total_sessions: 5, remaining_sessions: 5, service: { id: 1, name: '臉部保濕' } },
      }),
    }));

    // === 會員服務方案列表 (使用服務時下拉選單) ===
    await page.route('**/api/members/1/services', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 10, service_id: 1, remaining_sessions: 5, service: { id: 1, name: '臉部保濕' } }],
      }),
    }));

    // === 使用傳統服務 API ===
    await page.route('**/api/service-logs', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, remaining: 4 } }),
    }));

    // ========== 1. 登入 ==========
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // ========== 2. 前往會員詳情 ==========
    await page.goto('/admin/members/1');
    await page.waitForTimeout(500);

    // ========== 3. 購買傳統服務 ==========
    await page.getByText('購買傳統服務').first().click();
    await page.waitForTimeout(500);

    await page.selectOption('select', '1');
    await page.fill('input[type="number"]', '5');
    await page.click('button[type="submit"]');

    // 購買成功後 modal 會自動關閉，等待 overlay 消失
    await page.waitForSelector('.modal-overlay', { state: 'detached' });
    await page.waitForTimeout(300);

    // ========== 4. 驗證購買成功 ==========
    await page.getByText('使用傳統服務').first().click();
    await page.waitForTimeout(500);

    const selectEl = page.locator('select');
    await expect(selectEl).toContainText('剩餘 5 次');

        // 選擇該方案
    await selectEl.selectOption('10');

    // 點擊灰色簽名觸發區 → 導航到滿版簽名頁
    await page.locator('.signature-trigger').click();
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

    // 點擊「確認」按鈕，返回會員詳情頁
    await page.click('button:has-text("確認")');
    await page.waitForURL('**/admin/members/1');
    await page.waitForTimeout(300);

    // 確認簽名預覽圖片出現
    await expect(page.locator('.signature-preview')).toBeVisible();

    // 點擊「送出使用」
    await page.click('button[type="submit"]:has-text("送出使用")');

    // 驗證成功：modal 關閉
    await page.waitForSelector('.modal-overlay', { state: 'detached', timeout: 5000 });
  });
});