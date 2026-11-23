# SERP Preview — Free Google SERP Preview Tool

Live site: https://seo-snippet-preview.pages.dev/  
Author: [Md Mehedi Hasan](https://mehedihasan.work/)

A lightweight, privacy-first browser tool for editing an SEO title, meta description and display URL with live Google-style desktop and mobile snippet previews. The preview is approximate: Google may rewrite titles and snippets for different queries.

## Features
- Live title, description, and URL preview; desktop/mobile switch.
- Approximate title width and meta description length guidance (not official Google limits).
- Copy-ready HTML meta tags; user inputs are rendered as text, not HTML.
- Client-side operation; no backend, external fonts, tracking, or account required.
- Short, accessible FAQ about what the preview does and does not do.

## Live SEO and crawl configuration
- Homepage canonical: `https://seo-snippet-preview.pages.dev/`.
- `sitemap.xml` lists the single canonical homepage.
- `robots.txt` allows crawling and links to the XML sitemap.
- `404.html` enables actual HTTP 404 responses for unknown routes on Cloudflare Pages.
- `WebApplication` JSON-LD includes the live URL, free-access status and author.
- `_headers` contains security headers and a CSP hash for the inline JSON-LD.
- `google89a2099889f25c35.html` must remain deployed to preserve Google Search Console ownership verification.

## Deployment

This project is currently hosted on **Cloudflare Pages via Direct Upload**. This GitHub repository is a source mirror, **not** an automatic deployment integration.

To publish changes: create a ZIP containing the site files at its root (`index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `_headers`, the Google verification file, and `assets/`), then open Cloudflare Dashboard → Workers & Pages → `seo-snippet-preview` → Create deployment → Production.

**Do not remove the Google verification file.** If JSON-LD changes, recalculate the CSP hash in `_headers`; otherwise the browser might block the changed inline script.

## Verification checklist

After deploying, confirm that:
- `/` returns 200, the live tool works in both preview modes, and title/description inputs are HTML-escaped.
- `/sitemap.xml` returns 200 with an XML content type and one homepage `<loc>`.
- `/robots.txt` returns 200 with a sitemap declaration.
- A nonexistent URL returns HTTP 404 rather than the homepage.
- The Google verification URL still serves the expected token.
- Browser console has no application errors and the site has no horizontal overflow at 390px.

Google Search Console property verification has succeeded using the HTML file. Sitemap submission and indexing are separate processes; submitting the sitemap does not guarantee crawling, indexing, or ranking.
