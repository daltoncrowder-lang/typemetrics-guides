import { defineConfig } from 'astro/config';

// Static site. Pages live under /guides/* so they can be served at
// https://typemetrics.net/guides/* via a Cloudflare route (see README).
export default defineConfig({
  site: 'https://typemetrics.net',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
