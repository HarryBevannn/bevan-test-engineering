import { test, expect, type Page } from '@playwright/test';
import { NAV } from '../src/consts';
import { TEST_IDS, slugFromHref } from '../src/test-ids';
import { sitemapPaths } from './helpers';

/**
 * Test ID contract: proves the agreed data-testid "mapping" is present in the real site.
 * If a developer removes, renames or duplicates a test ID, or adds one that isn't in the
 * registry (src/test-ids.ts), these tests fail and say exactly which one.
 */

const NAMING_CONVENTION = /^[a-z0-9]+(-[a-z0-9]+)*$/; // feature-element, kebab-case

const serviceIds = sitemapPaths()
  .filter((p) => /^\/services\/[^/]+\/$/.test(p))
  .map((p) => p.split('/')[2]);

const navSlugs = NAV.map((item) => slugFromHref(item.href));

/** Test IDs that appear on every page (layout, header and footer). */
const everyPage = [
  TEST_IDS.layout.skipLink,
  TEST_IDS.header.logoLink,
  ...navSlugs.map(TEST_IDS.header.navLink),
  ...navSlugs.map(TEST_IDS.footer.navLink),
  TEST_IDS.footer.emailLink,
  TEST_IDS.footer.linkedinLink,
  TEST_IDS.footer.qualityBadge,
];

/** Test IDs each page must provide, on top of the shared ones. */
const contract: Record<string, string[]> = {
  '/': [
    TEST_IDS.home.consultationButton,
    TEST_IDS.home.servicesButton,
    TEST_IDS.home.qualityButton,
    TEST_IDS.callToAction.contactButton,
    ...serviceIds.flatMap((id) => [TEST_IDS.services.card(id), TEST_IDS.services.cardLink(id)]),
  ],
  '/services/': [
    TEST_IDS.callToAction.contactButton,
    ...serviceIds.flatMap((id) => [TEST_IDS.services.card(id), TEST_IDS.services.cardLink(id)]),
  ],
  ...Object.fromEntries(
    serviceIds.map((id) => [`/services/${id}/`, [TEST_IDS.services.backLink, TEST_IDS.callToAction.contactButton]])
  ),
  '/about/': [TEST_IDS.callToAction.contactButton],
  '/contact/': Object.values(TEST_IDS.contact),
  '/quality/': [...Object.values(TEST_IDS.quality), TEST_IDS.callToAction.contactButton],
  '/thanks/': [TEST_IDS.thanks.homeButton],
  '/missing-page-for-contract-test/': [TEST_IDS.notFound.homeButton],
};

/** Every test ID the registry knows about, with dynamic IDs expanded for the real services and nav. */
const registered = new Set<string>(Object.values(contract).flat().concat(everyPage));

async function testIdsOn(page: Page) {
  return page.locator('[data-testid]').evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')!));
}

test.describe('Test ID contract', () => {
  for (const [path, ids] of Object.entries(contract)) {
    test(`${path} provides all of its agreed test IDs`, async ({ page }) => {
      await page.goto(path);
      const missing: string[] = [];
      for (const id of [...everyPage, ...ids]) {
        if ((await page.getByTestId(id, { exact: true }).count()) === 0) missing.push(id);
      }
      expect(missing, 'Test IDs missing from the page').toEqual([]);
    });

    test(`${path} test IDs are unique, registered and follow the naming convention`, async ({ page }) => {
      await page.goto(path);
      const found = await testIdsOn(page);

      const duplicates = found.filter((id, i) => found.indexOf(id) !== i);
      const unregistered = found.filter((id) => !registered.has(id));
      const badlyNamed = found.filter((id) => !NAMING_CONVENTION.test(id));

      expect(duplicates, 'Duplicate test IDs').toEqual([]);
      expect(unregistered, 'Test IDs not in src/test-ids.ts').toEqual([]);
      expect(badlyNamed, 'Test IDs not in feature-element kebab-case').toEqual([]);
    });
  }

  test('every interactive element on the site has a test ID', async ({ page }) => {
    const untagged: string[] = [];
    for (const path of sitemapPaths()) {
      await page.goto(path);
      const found = await page
        .locator('main a, main button, main input:not([type="hidden"]), main select, main textarea, header a, footer a')
        .evaluateAll((els) =>
          els
            // Links written inside page copy (Markdown) are content, not UI controls, so they're exempt.
            .filter((el) => !el.closest('.prose-content'))
            // Elements inside a tagged container (e.g. results rendered into the results panel) are covered by it.
            .filter((el) => !el.hasAttribute('data-testid') && !el.closest('[data-testid]:not(form)'))
            .filter((el) => el.getAttribute('name') !== 'bot-field')
            .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('name') || '').trim()}"`)
        );
      found.forEach((el) => untagged.push(`${path}: ${el}`));
    }
    expect(untagged, 'Interactive elements without a data-testid').toEqual([]);
  });
});
