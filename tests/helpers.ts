import fs from 'node:fs';
import type { Page } from '@playwright/test';

/**
 * Every page in the built sitemap, as a path (e.g. "/services/test-automation/").
 * Reading the sitemap means new pages are tested automatically, with no test changes.
 */
export function sitemapPaths(): string[] {
  const xml = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

export const isLive = !!process.env.BASE_URL;

/** Collects console errors and uncaught exceptions raised while a page is open. */
export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}
