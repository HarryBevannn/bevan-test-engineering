import { test, expect } from '@playwright/test';
import { NAV } from '../src/consts';
import { TEST_IDS, slugFromHref } from '../src/test-ids';
import { sitemapPaths } from './helpers';

const serviceIds = sitemapPaths()
  .filter((p) => /^\/services\/[^/]+\/$/.test(p))
  .map((p) => p.split('/')[2]);

test.describe('Navigation', () => {
  const headings: Record<string, string> = {
    services: 'Services',
    about: 'About',
    quality: 'This site tests itself',
    contact: 'Get in touch',
  };

  for (const item of NAV) {
    const slug = slugFromHref(item.href);

    test(`main menu "${item.label}" link opens the right page`, async ({ page }) => {
      await page.goto('/');
      const link = page.getByTestId(TEST_IDS.header.navLink(slug));
      await link.click();

      await expect(page).toHaveURL(new RegExp(`${item.href}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(headings[slug]);
      await expect(page.getByTestId(TEST_IDS.header.navLink(slug))).toHaveAttribute('aria-current', 'page');
    });

    test(`footer "${item.label}" link opens the right page`, async ({ page }) => {
      await page.goto('/');
      await page.getByTestId(TEST_IDS.footer.navLink(slug)).click();
      await expect(page).toHaveURL(new RegExp(`${item.href}$`));
    });
  }

  test('logo returns to the home page', async ({ page }) => {
    await page.goto('/about/');
    await page.getByTestId(TEST_IDS.header.logoLink).click();
    await expect(page).toHaveURL(/\/$/);
  });

  for (const id of serviceIds) {
    test(`service card "${id}" opens its page and links back`, async ({ page }) => {
      await page.goto('/services/');
      const link = page.getByTestId(TEST_IDS.services.cardLink(id));
      const title = (await link.innerText()).trim();

      await link.click();
      await expect(page).toHaveURL(new RegExp(`/services/${id}/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

      await page.getByTestId(TEST_IDS.services.backLink).click();
      await expect(page).toHaveURL(/\/services\/$/);
    });
  }

  test('"Book a free consultation" leads to the contact form', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(TEST_IDS.home.consultationButton).click();
    await expect(page.getByTestId(TEST_IDS.contact.form)).toBeVisible();
  });

  test('"View services" leads to the services page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(TEST_IDS.home.servicesButton).click();
    await expect(page).toHaveURL(/\/services\/$/);
  });

  test('"See it in action" leads to the Quality page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(TEST_IDS.home.qualityButton).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This site tests itself');
  });

  test('"Get in touch" call to action leads to the contact form', async ({ page }) => {
    await page.goto('/about/');
    await page.getByTestId(TEST_IDS.callToAction.contactButton).click();
    await expect(page.getByTestId(TEST_IDS.contact.form)).toBeVisible();
  });

  test('unknown pages show the custom 404 page with a way home', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Spaghetti Junction');

    await page.getByTestId(TEST_IDS.notFound.homeButton).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Links', () => {
  test('no internal link on any page is broken', async ({ page, request }) => {
    const hrefs = new Set<string>();
    for (const path of sitemapPaths()) {
      await page.goto(path);
      const links = await page.locator('a[href^="/"]').evaluateAll((els) =>
        els.map((el) => el.getAttribute('href')!)
      );
      links.forEach((href) => hrefs.add(href.split('#')[0]));
    }

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${href} (${res.status()})`);
    }
    expect(broken, 'Broken links').toEqual([]);
  });
});
