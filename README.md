# TypeMetrics Guides — static Astro site

This is the **content layer** for TypeMetrics, moved off the Base44 SPA so the guide
pages render as real static HTML that Google can index immediately. The interactive
typing test stays on Base44 — only `/guides/*` moves here.

All 21 published guides were exported from the Base44 `Article` entity into
`src/data/articles.json`. `npm run build` bakes each one into a complete HTML file
under `dist/guides/<slug>/index.html`, with the correct `<title>`, meta description,
canonical URL, and Article + Breadcrumb JSON-LD already in the markup — no JS
execution or API call required to see the content.

URLs are **identical** to the current ones (`https://typemetrics.net/guides/<slug>`),
so nothing that's already indexed breaks.

## Build

```
npm install
npm run build      # outputs to ./dist
```

## Deploy (GitHub → Cloudflare Pages)

1. **Push to GitHub** (PowerShell + git — preserves the folder structure):
   ```
   cd typemetrics-guides
   git init
   git add .
   git commit -m "TypeMetrics guides static site"
   git branch -M main
   git remote add origin https://github.com/<you>/typemetrics-guides.git
   git push -u origin main
   ```
2. **Create a Cloudflare Pages project** from that repo:
   - Build command: `npm install && npm run build`
   - Build output directory: `dist`
   - Framework preset: Astro (or None)
   - It deploys to `https://typemetrics-guides.pages.dev`. Confirm
     `https://typemetrics-guides.pages.dev/guides/what-is-a-good-typing-speed` loads.

## Serving `/guides/*` on the apex (the one infra step)

The goal: `typemetrics.net/guides/*` served by this Pages project, everything else
still served by Base44. That keeps the guides as a **subfolder** of the main domain
(best for authority) instead of a weaker subdomain.

**Prerequisite:** `typemetrics.net` must be proxied through Cloudflare (orange cloud).
If its DNS is currently pointed straight at Base44 from Name.com, you'll move the
domain onto Cloudflare first and set the root record to proxy Base44's origin. Tell me
where the DNS lives now and I'll write the exact records.

Once the domain is on Cloudflare, add a **Worker** with a route of
`typemetrics.net/guides*` that serves this Pages project for those paths:

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    // /guides and /guides/* -> the static Pages deployment
    const target = "https://typemetrics-guides.pages.dev" + url.pathname + url.search;
    return fetch(target, request);
  },
};
```

Everything not matching `/guides*` never hits the Worker and continues to Base44 as
normal.

## After it's live

- The Base44 sitemap function (`generateSitemap`) already lists every `/guides/<slug>`
  URL, and the `Article` records still exist, so **the sitemap stays correct** — just
  re-submit `https://typemetrics.net/sitemap.xml` in Search Console.
- Use **URL Inspection → Request indexing** on the ~11 guide URLs that were stuck in
  "Discovered – currently not indexed." Now that they return real HTML, they should
  move to Indexed.
- Spot-check with `view-source:` on a couple of guide URLs — you should see the full
  article text in the raw HTML.

## Adding new guides later

1. Add an object to `src/data/articles.json` (same fields as the others), rebuild, push.
2. So the new URL also lands in the sitemap, add a matching record to the Base44
   `Article` entity (metadata is enough). Or tell me and I'll switch sitemap
   generation over to Astro so there's a single source of truth.

## AdSense / CMP note

The layout includes the `google-adsense-account` meta tag and the AdSense loader
(parity with the main app), which helps re-approval since these are real content pages.
Before serving ads to EEA/UK/Switzerland visitors, make sure a **certified IAB TCF v2.2
CMP** covers these pages too — the static site does not inherit the Base44 consent
banner. This is the same CMP requirement that applies across the portfolio.
