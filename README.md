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

Every push to `main` redeploys automatically.

## Adding a custom domain later

1. Buy the domain (e.g. Cloudflare Registrar or Namecheap).
2. In Netlify: **Domain management → Add a domain**, and follow the DNS instructions.
3. Update `site` in `astro.config.mjs` and the sitemap URL in `public/robots.txt`.
