# SERP Preview Tool

A privacy-first, client-side SEO snippet editor. Preview approximate Google-style search results, edit titles and descriptions, compare desktop and mobile layouts, and export HTML meta tags.

**Live demo:** https://seo-snippet-preview.pages.dev/
**Developer:** [Mehedi Hasan](https://mehedihasan.work/)

## Features
- Real-time preview, Unicode-aware character counts and approximate width guidance.
- Desktop and mobile layouts, RTL text, keyboard controls and responsive design.
- Safe text rendering, URL validation, HTML escaping, clipboard and downloadable meta tags.
- Optional local draft persistence and a clear-draft control; no account, tracking, API or backend.
- Crawlable help content, canonical URL, sitemap, social metadata and WebApplication structured data.

Google can rewrite titles and descriptions; this tool is not an official Google product, ranking checker, AI citation predictor or exact SERP simulator.

## Run locally
Requires Node.js 24 or compatible modern Node.js. No runtime npm dependencies.

```sh
npm ci
npm run serve
```

Open http://127.0.0.1:49387/. The development server applies the same security headers as the Cloudflare configuration.

## Quality checks

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit tests cover Unicode, URLs, escaping and draft validation. Browser tests cover live editing, device mode, storage, export, keyboard interaction, responsive widths, accessibility and HTTP assets. GitHub Actions runs the same checks. Automated accessibility tests are not a complete WCAG conformance audit.

## Architecture
- `index.html`: semantic page and metadata.
- `assets/core.js`: pure, testable validation and serialization helpers.
- `assets/app.js`: browser state, rendering and interaction.
- `assets/styles.css`: responsive presentation.
- `tests/`: Node and Playwright regression tests.
- `scripts/`: local server and release builder.

The application intentionally uses native JavaScript modules, HTML and CSS rather than introducing a framework for a small tool.

## Privacy and security
Inputs are processed locally; the editor never fetches an entered URL or transmits its values. Draft storage is opt-in, remains on the device and can be cleared. Do not save confidential text on shared devices. No runtime third-party scripts or fonts. CSP, safe DOM rendering, URL protocol checks and HTML escaping provide defense in depth.

## Deployment
Cloudflare Pages currently uses Direct Upload; this GitHub repository is not an automatic deploy integration.

Run `npm run build` and upload only the contents of `dist/` through Cloudflare Pages. Preserve the Google verification file and canonical URL. If inline JSON-LD changes, update its CSP SHA-256 hash in `_headers`. Verify the live URL, sitemap, real 404, security headers, Google verification file and browser functions after deployment.

For production smoke tests:
```sh
TEST_URL=https://seo-snippet-preview.pages.dev npm run test:e2e
```

Previous deploys can be restored through the Cloudflare Pages deployment history.

## Limitations
Text width is a visual approximation based on the browser and installed fonts. Google may select entirely different text. Search indexing, ranking, AI citations and full WCAG compliance are not guaranteed. See [Google Search documentation](https://developers.google.com/search/docs/appearance) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
