/**
 * Test ID registry: the single source of truth for every `data-testid` on the site.
 *
 * The site's components set these attributes and the Playwright tests locate elements by them,
 * both importing from this file. That gives test IDs that:
 *  - never drift between the markup and the tests (a typo is a type error, not a flaky test),
 *  - survive copy and styling changes (renaming a button's text doesn't break the tests),
 *  - are covered by a contract test (tests/test-ids.spec.ts) that proves each one exists on its page.
 *
 * Naming convention: <area>-<element>[-<variant>], in kebab-case.
 */
export const TEST_IDS = {
  layout: {
    skipLink: 'skip-link',
  },
  header: {
    logoLink: 'header-logo-link',
    navLink: (slug: string) => `nav-link-${slug}`,
  },
  footer: {
    navLink: (slug: string) => `footer-nav-link-${slug}`,
    emailLink: 'footer-email-link',
    linkedinLink: 'footer-linkedin-link',
    qualityBadge: 'footer-quality-badge',
  },
  home: {
    consultationButton: 'hero-consultation-button',
    servicesButton: 'hero-services-button',
    qualityButton: 'home-quality-button',
  },
  callToAction: {
    contactButton: 'cta-contact-button',
  },
  services: {
    card: (id: string) => `service-card-${id}`,
    cardLink: (id: string) => `service-card-link-${id}`,
    backLink: 'service-back-link',
  },
  contact: {
    form: 'contact-form',
    nameInput: 'contact-name-input',
    emailInput: 'contact-email-input',
    companyInput: 'contact-company-input',
    serviceSelect: 'contact-service-select',
    messageInput: 'contact-message-input',
    submitButton: 'contact-submit-button',
    emailLink: 'contact-email-link',
    linkedinLink: 'contact-linkedin-link',
  },
  quality: {
    results: 'quality-results',
    runLiveButton: 'quality-run-live-button',
    liveSummary: 'quality-live-summary',
    liveTable: 'quality-live-table',
    pipelineLink: 'quality-pipeline-link',
    testsLink: 'quality-tests-link',
  },
  notFound: {
    homeButton: 'not-found-home-button',
  },
  thanks: {
    homeButton: 'thanks-home-button',
  },
} as const;

/** "/services/" -> "services", used to build nav link IDs from NAV hrefs. */
export const slugFromHref = (href: string) => href.replace(/^\/|\/$/g, '') || 'home';
