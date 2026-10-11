# Krishna Revanth — Portfolio

Personal UX portfolio. Plain static HTML/CSS with a little JS: no build step, no framework, no trackers.

## Structure

```
index.html                               Home: hero, selected work, AI approach, about, contact
work/mailchimp-sales-enablement/         Case study 01
work/quickbooks-rate-tables/             Case study 02 (in progress)
404.html
assets/css/site.css                      Design tokens + all styles
assets/js/site.js                        Progressive enhancement (receipt demo announcements, TOC highlight)
assets/favicon.svg
vercel.json                              Clean URLs + asset caching for Vercel
```

## Run locally

```bash
python -m http.server 4321
```

Then open http://localhost:4321.

## Draft markers

Anything wrapped in `<span class="todo">…</span>` is a visible placeholder waiting on a fact or approval. Search for `class="todo"` before launch; none should remain.

## Deploy

Not deployed yet. On Vercel: import this repo, framework preset **Other**, no build command, output directory `.`.
