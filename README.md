# SERP Preview — Free Google-style search snippet editor

A lightweight, self-contained, static SEO tool built by Md Mehedi Hasan for a Cloudflare Pages deployment and his developer portfolio.

## Features
- Instant Google-style title, meta description and URL previews.
- Desktop and mobile visual modes.
- Approximate title pixel width (canvas-based) and meta-description character counter.
- Copy `<title>` and meta description HTML snippets.
- Accessible controls, responsive layout and user input handled as **text**, not HTML.
- No backend, dependencies, cookies, external fonts or analytics.
- Contextual author portfolio link: https://mehedihasan.work/

## Deploy to Cloudflare Pages
1. Visit https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Create a **Pages** project using **Direct Upload**.
3. Drag in the `serp-preview-tool.zip` archive (or this folder), then deploy.
4. Your Pages URL is assigned by Cloudflare. Replace generic project references and add a canonical URL only after the permanent URL is confirmed.
5. Check the page on desktop/mobile and confirm the portfolio link and copy buttons work on the HTTPS deployment.

The archive is packaged with `index.html` at its root (not nested within another folder).

## Google accuracy note
Google may generate its own result titles and snippets. The width/length meter is an **editorial heuristic**, not an official Google pixel or character limit and not a guarantee of rendered results. See:
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet

## Deployment status
Source files are ready for deployment; no live Cloudflare deployment is implied.