import { test, expect } from '@playwright/test';
import { sitemapPaths, trackPageErrors } from './helpers';

const PAGE_WEIGHT_BUDGET_KB = 300;

for (const path of sitemapPaths()) {
  test.describe(`Page ${path}`, () => {
    test('loads with a title, one main heading and no errors', async ({ page }) => {
      const errors = trackPageErrors(page);
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Bevan Test Engineering/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      expect(errors).toEqual([]);
    });

    test('has search engine metadata', async ({ page }) => {
      await page.goto(path);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length).toBeGreaterThan(50);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(new URL(canonical!).pathname).toBe(path);

      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    });

    test('fits the screen without sideways scrolling', async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`stays under the ${PAGE_WEIGHT_BUDGET_KB} KB page weight budget`, async ({ page }) => {
      let bytes = 0;
      page.on('response', async (res) => {
        const body = await res.body().catch(() => Buffer.alloc(0));
        bytes += body.length;
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(bytes / 1024).toBeLessThan(PAGE_WEIGHT_BUDGET_KB);
    });
  });
}
