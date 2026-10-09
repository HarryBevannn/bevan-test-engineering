// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: replace with your real domain once purchased (also update public/robots.txt)
  site: 'https://bevan-test-engineering.netlify.app',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap({ filter: (page) => !page.endsWith('/thanks/') })]
});
