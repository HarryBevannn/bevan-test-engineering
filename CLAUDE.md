## Project

Marketing site for Bevan Test Engineering (software testing consultancy). Fully static Astro 7 + Tailwind 4, deployed to Netlify. No backend, no client-side framework; keep it that way unless there's a strong reason.

- Site-wide details (name, email, nav): `src/consts.ts`
- Services are a content collection: `src/content/services/*.md`, schema in `src/content.config.ts`
- Brand tokens and shared classes (`container-page`, `btn-primary`, `prose-content`): `src/styles/global.css`
- Contact form uses Netlify Forms (`data-netlify` attribute + hidden `form-name` field); keep those intact
- Copy marked `PLACEHOLDER` / `TODO` still needs the owner's real wording; don't invent credentials or client names
- UK English throughout
- Run `npm run build` then `npm test` to verify changes (Playwright, ~1 min). Deploys happen from GitHub Actions only after all tests pass
- Every interactive element needs a `data-testid` from `src/test-ids.ts` (feature-element kebab-case); the contract test fails otherwise

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
