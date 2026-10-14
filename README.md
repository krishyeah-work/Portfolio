# Krishna Revanth — Portfolio

Static HTML, CSS and a little vanilla JS. No framework, no build step, no trackers.

## Structure

Every page and every project is self-contained, so an edit only touches the files for that page.

```
index.html                     Home (hero, work list, approach, about, contact)
404.html
assets/
  css/base.css                 Shared: tokens, type, header, footer, buttons, screenshot frame
  css/home.css                 Home page only
  css/case-study.css           Shared case-study layout and components (carousel, lightbox, toc, reveal…)
  css/footer-live.css          Footer clock and Pal
  js/site.js                   Every page: name scramble, nav hover pill, scroll-to-top
  js/clock.js                  Live Bengaluru clock with sliding digits ([data-clock])
  js/pal.js                    Pal: asleep 11:00 PM–6:30 AM IST, local-language hello ([data-pal]); ?pal=awake|asleep to preview
  js/reveal.js                 Case studies: title text effect ([data-text-fade]) and in-view reveal
  js/toc.js                    Highlights the case-study contents link in view
  js/carousel.js               Scroll-snap carousel  ([data-carousel])
  js/lightbox.js               Click any screen to enlarge and zoom (.shot img, img[data-zoom])
  favicon.svg
api/
  geo.js                       Vercel function: returns only the visitor's country/state code for Pal's hello
work/
  mailchimp/                   Case study 01, everything for it lives here
    index.html
    mailchimp.css              Styles used only by this case study
    cover.css / cover.js       Logo-in-pixel-dust cover, shared with the homepage card
    mailchimp.js               Cart-explorations scroll sequence (carts land in the dashboard's cart slot)
    img/                       Optimized WebP; *-lg.webp are the sharper lightbox versions;
                               sales-dash*.svg are Krishna's yellow-line dashboards; cart-*/dlg-* are
                               transparent crops placed on them at true scale
  quickbooks-rate-tables/      Case study 02 (in progress)
portfolio-context/             Brief, case-study notes, decisions log (local only, not pushed)
```

### Editing guide

| To change… | Open only… |
|---|---|
| MailChimp case study text or images | `work/mailchimp/index.html` (+ `img/`) |
| MailChimp-only visuals (hero dust, channels figure, cart sequence, dialogs on the dashboard) | `work/mailchimp/mailchimp.css` / `.js` |
| Anything shared by all case studies | `assets/css/case-study.css` |
| Colours, fonts, header, footer | `assets/css/base.css` |
| Pal's lines, greetings or sleep hours | `assets/js/pal.js` |
| Clock | `assets/js/clock.js` + `assets/css/footer-live.css` |
| Home page | `index.html` + `assets/css/home.css` |

### Adding a new case study

1. Copy `work/mailchimp/index.html` into `work/<project>/index.html` and replace the content.
2. Keep the three shared stylesheets/scripts; add `<project>.css` / `.js` only if the project needs bespoke visuals.
3. Put images in `work/<project>/img/` as WebP (1600px wide, plus `-lg` at 2400px for zoom if useful).
4. Add a card to `index.html`.

## Run locally

```bash
python -m http.server 4321
```

Then open http://localhost:4321.

## Draft markers

`<span class="todo">…</span>` marks a fact or approval still pending. Search for `class="todo"` before launch.

## Deploy

Connected to Vercel: every push to `main` deploys to production. Framework preset **Other**, no build command. Bump the `?v=` version on CSS/JS links whenever those files change.
