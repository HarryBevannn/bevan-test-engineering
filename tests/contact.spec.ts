import { test, expect } from '@playwright/test';
import { TEST_IDS } from '../src/test-ids';

const ids = TEST_IDS.contact;

// These tests never submit the form, so they are safe to run against the live site.
test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact/');
  });

  test('is set up for Netlify Forms with a spam honeypot', async ({ page }) => {
    const form = page.getByTestId(ids.form);
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form.locator('input[name="form-name"]')).toHaveValue('contact');
    await expect(form.locator('input[name="bot-field"]')).toBeHidden();
  });

  test('blocks submission when required fields are empty', async ({ page }) => {
    await page.getByTestId(ids.submitButton).click();

    await expect(page).toHaveURL(/\/contact\/$/);
    for (const field of [ids.nameInput, ids.emailInput, ids.messageInput]) {
      const missing = await page.getByTestId(field).evaluate((el: HTMLInputElement) => el.validity.valueMissing);
      expect(missing, `${field} should be required`).toBe(true);
    }
  });

  test('company field is optional', async ({ page }) => {
    const required = await page.getByTestId(ids.companyInput).evaluate((el: HTMLInputElement) => el.required);
    expect(required).toBe(false);
  });

  test('rejects an invalid email address', async ({ page }) => {
    const email = page.getByTestId(ids.emailInput);
    await email.fill('not-an-email');
    const invalid = await email.evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
    expect(invalid).toBe(true);
  });

  test('accepts a complete, valid enquiry', async ({ page }) => {
    await page.getByTestId(ids.nameInput).fill('Test Person');
    await page.getByTestId(ids.emailInput).fill('test@example.com');
    await page.getByTestId(ids.serviceSelect).selectOption({ index: 1 });
    await page.getByTestId(ids.messageInput).fill('Checking the form validates correctly.');

    const valid = await page.getByTestId(ids.form).evaluate((f: HTMLFormElement) => f.checkValidity());
    expect(valid).toBe(true);
  });

  test('fields have visible labels', async ({ page }) => {
    for (const [field, label] of [
      [ids.nameInput, 'Name'],
      [ids.emailInput, 'Email'],
      [ids.messageInput, 'Message'],
    ]) {
      await expect(page.getByLabel(label, { exact: true })).toHaveAttribute('data-testid', field);
    }
  });

  test('offers every service in the dropdown', async ({ page }) => {
    const options = await page.getByTestId(ids.serviceSelect).locator('option').allInnerTexts();

    await page.goto('/services/');
    const services = await page.locator('[data-testid^="service-card-link-"]').allInnerTexts();

    expect(services.length).toBeGreaterThan(0);
    for (const service of services) expect(options).toContain(service.trim());
  });

  test('email link opens a new email to the right address', async ({ page }) => {
    await expect(page.getByTestId(ids.emailLink)).toHaveAttribute('href', /^mailto:.+@.+/);
  });
});
