import { test, expect } from '@playwright/test';
import { isLive, sitemapPaths } from './helpers';

test.describe('Site health', () => {
  test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Allow: /');
    expect(body).toMatch(/Sitemap: https:\/\/.+\/sitemap-index\.xml/);
  });

  test('sitemap lists every public page and hides the thank-you page', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);

    const paths = sitemapPaths();
    expect(paths).toContain('/');
    expect(paths).toContain('/contact/');
    expect(paths.some((p) => p.startsWith('/services/') && p !== '/services/')).toBe(true);
    expect(paths).not.toContain('/thanks/');
  });

  test('favicon is served', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('svg');
  });

  test('pipeline test results are published', async ({ request }) => {
    test.skip(!isLive, 'Results are added to the site by the pipeline, just before deploy');
    const res = await request.get('/quality/results.json');
    expect(res.status()).toBe(200);
    const results = await res.json();
    expect(results.stats.failed).toBe(0);
  });

  test('security headers are set on the live site', async ({ request }) => {
    test.skip(!isLive, 'Headers are applied by Netlify, so only checked against the live site');
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['strict-transport-security']).toBeTruthy();
  });
});
