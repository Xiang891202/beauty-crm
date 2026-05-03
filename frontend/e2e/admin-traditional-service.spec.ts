import { test, expect } from '@playwright/test';

test.describe('傳統服務購買與使用', () => {
  test('管理員可以為會員購買傳統服務，並使用該服務', async ({ page }) => {

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
    // ========== Mock APIs ==========
    // 會員詳情
    await page.route('**/api/members/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 1, name: '王美美', phone: '0912345678' },
        }),
      });
    });

    // 全部服務列表 (購買用)
    await page.route('**/api/services*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: '臉部保濕', price: 800 },
            { id: 2, name: '深層清潔', price: 1200 },
          ],
        }),
      });
    });

    // 購買傳統服務
    await page.route('**/api/member-services', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 10,
            customer_id: 1,
            service_id: 1,
            total_sessions: 5,
            remaining_sessions: 5,
            service: { id: 1, name: '臉部保濕' },
          },
        }),
      });
    });

    // 會員目前的服務方案 (使用服務時下拉選單)
    await page.route('**/api/members/1/services', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 10,
              service_id: 1,
              remaining_sessions: 5,
              service: { id: 1, name: '臉部保濕' },
            },
          ],
        }),
      });
    });

    // 使用傳統服務 API
    await page.route('**/api/service-logs', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 1, remaining: 4 },
        }),
      });
    });

    // ========== 測試流程 ==========

    // 1. 管理員登入
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // 2. 前往會員詳情
    await page.goto('/admin/members/1');
    await page.waitForTimeout(500);

    // 3. 購買傳統服務
    // 點擊「購買傳統服務」按鈕
    await page.getByText('購買傳統服務').first().click();
    await page.waitForTimeout(500);

    // 選擇服務
    await page.selectOption('select', '1'); // 第一個服務
    // 輸入購買次數
    await page.fill('input[type="number"]', '5');
    // 點擊購買按鈕
    await page.click('button[type="submit"]');

    // 處理成功訊息 alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('購買成功');
      await dialog.accept();
    });

    // 等待 modal 關閉
    await page.waitForTimeout(500);

    // 4. 使用傳統服務
    // 點擊「使用傳統服務」按鈕
    await page.getByText('使用傳統服務').first().click();
    await page.waitForTimeout(500);

    // 選擇服務方案 (應該只有一個)
    await page.selectOption('select', '10'); // value 是 member_service_id

    // 輸入備註
    await page.fill('textarea', '測試備註');

    // 模擬簽名：在 canvas 上畫一條線
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

    // 點擊送出使用
    await page.click('button[type="submit"]');

    // 驗證成功訊息
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('使用成功');
      await dialog.accept();
    });

    // 等待結果
    await page.waitForTimeout(500);
  });
});