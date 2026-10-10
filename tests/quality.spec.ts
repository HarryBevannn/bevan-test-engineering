import { test, expect } from '@playwright/test';
import { TEST_IDS } from '../src/test-ids';
import { isLive } from './helpers';

const ids = TEST_IDS.quality;

test.describe('Quality page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quality/');
  });

  test('shows the latest pipeline results', async ({ page }) => {
    const results = page.getByTestId(ids.results);
    await expect(results).not.toContainText('Loading results');
    if (isLive) {
      await expect(results).toContainText('Tests passed');
      await expect(results).toContainText('Failed');
    }
  });

  test('"Run live checks" tests the site from the browser and reports the outcome', async ({ page }) => {
    const button = page.getByTestId(ids.runLiveButton);
    await button.click();

    const summary = page.getByTestId(ids.liveSummary);
    await expect(summary).toHaveText(/\d+ of \d+ live checks passed/, { timeout: 30_000 });
    await expect(button).toHaveText('Run live checks again');

    const rows = page.getByTestId(ids.liveTable).locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(5);

    // On the real site every check should pass. Locally, HTTPS and the Netlify headers don't exist.
    if (isLive) {
      const text = (await summary.textContent())!;
      const [, passed, total] = text.match(/(\d+) of (\d+)/)!;
      expect(passed).toBe(total);
    }
  });

  test('links to the pipeline history and the test code on GitHub', async ({ page }) => {
    await expect(page.getByTestId(ids.pipelineLink)).toHaveAttribute('href', /github\.com\/.+\/actions/);
    await expect(page.getByTestId(ids.testsLink)).toHaveAttribute('href', /github\.com\/.+\/tests/);
  });
});
