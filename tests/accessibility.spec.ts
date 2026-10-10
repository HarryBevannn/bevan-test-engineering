import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitemapPaths } from './helpers';
import { TEST_IDS } from '../src/test-ids';

// Scan with animations off so elements are checked in their final state.
test.use({ reducedMotion: 'reduce' });

test.describe('Accessibility (WCAG 2.2 AA)', () => {
  for (const path of sitemapPaths()) {
    test(`${path} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} element(s))`);
      expect(summary).toEqual([]);
    });
  }

  test('skip link lets keyboard users jump to the content', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile', 'Keyboard navigation is a desktop concern');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByTestId(TEST_IDS.layout.skipLink);
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test('animations are switched off for people who prefer reduced motion', async ({ page }) => {
    await page.goto('/');
    const animation = await page.locator('.skyline-bull').evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });
});
