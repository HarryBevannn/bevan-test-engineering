# Bevan Test Engineering

Marketing site for Bevan Test Engineering, a software testing consultancy.

**Stack:** [Astro](https://astro.build) (static site) · Tailwind CSS · Markdown content · Netlify (hosting + contact form)

## Run locally

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Editing content

| What | Where |
|---|---|
| Business name, email, LinkedIn, nav links | `src/consts.ts` |
| Services (one Markdown file per service) | `src/content/services/*.md` |
| Home page copy | `src/pages/index.astro` |
| About page | `src/pages/about.astro` |
| Contact form | `src/pages/contact.astro` |
| Colours and fonts | `src/styles/global.css` (`@theme` block) |

**Add a service:** copy an existing file in `src/content/services/`, rename it (the filename becomes the URL), and edit the front matter and body. Use `order` to control its position.

Search for `PLACEHOLDER` and `TODO` to find copy that still needs writing.

## Deploying (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git**, then pick the repo. Build settings come from `netlify.toml`.
3. Under **Site configuration → Site details**, rename the site to `bevan-test-engineering` so it's served at `https://bevan-test-engineering.netlify.app`.
4. Under **Forms**, enable form detection, then add an email notification so enquiries reach your inbox.

Every push to `main` is tested and, if everything passes, released automatically (see below).

## Adding a custom domain later

1. Buy the domain (e.g. Cloudflare Registrar or Namecheap).
2. In Netlify: **Domain management → Add a domain**, and follow the DNS instructions.
3. Update `site` in `astro.config.mjs` and the sitemap URL in `public/robots.txt`.

## Testing and the quality pipeline

The site tests itself with Playwright. See the public results at `/quality/`.

```sh
npm run build                 # tests run against the built site in dist/
npm test                      # full suite, desktop + mobile
npm run test:report           # open the HTML report of the last run
BASE_URL=https://bevan-test-engineering.netlify.app npm test   # test the live site
```

- Tests live in `tests/`. Pages are discovered from the sitemap, so new pages are tested automatically.
- Every `data-testid` comes from `src/test-ids.ts` (naming: `feature-element`, kebab-case). The site and the
  tests both import it, and `tests/test-ids.spec.ts` checks the contract: every agreed ID is present, unique,
  registered and correctly named, and every interactive element has one.
- `.github/workflows/ci.yml`: on every push to `main` the site is built and tested. **Only a fully passing
  version** is pushed (with its test results) to the `production` branch, which is the only branch Netlify
  deploys. The suite then runs again against the live site. It also re-tests the live site every morning.
- Never push to `production` by hand; it's managed by the pipeline.
