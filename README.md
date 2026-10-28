# Krishna Revanth — Portfolio

Static HTML, CSS and a little vanilla JS. No framework, no build step, no trackers.

## Structure

Every page and every project is self-contained, so an edit only touches the files for that page.

```
index.html                     Home (intro with contact links, work list)
about/index.html               More about me: story, experience, education, tools, playlist
404.html
assets/
  css/base.css                 Shared: tokens (dark + light themes), type, header and phone menu, footer, buttons, screenshot frame
                               Sizes are in rem; with a mouse or trackpad 1rem shrinks on laptop-width windows (12px up to 1440px wide, 16px from 2400px)
  css/home.css                 Home page only
  css/about.css                About page only
  css/case-study.css           Shared case-study layout and components (carousel, lightbox, toc, reveal, "Also check out"…)
  css/work-art.css             Project colours and the animated QuickBooks / Net Terms thumbnails (home cards + previews)
  css/footer-live.css          Footer: clock (left), Pal (centre), "Looking to Contact" (right), and the Bangalore strip
  js/site.js                   Every page: name scramble, nav hover pill, scroll-to-top, image retry,
                               light/dark switch, phone menu, arrival highlight (marker on the heading you
                               jumped to; colour from --hl; [data-hl-group] + [data-hl] for groups of links)
  js/bangalore.js              Van Gogh-style Bangalore above every footer, drawn to scale; sky follows Bangalore time (?sky=dawn|day|dusk|night to preview)
  js/intro.js                  Home intro: words fade in on load, then (first visit per session) the nav and the work;
                               letters near the pointer thicken along that line (mouse only); Email hover copies the address
  js/about.js                  About page: loads the Spotify player only when "Listen here" is pressed
  js/clock.js                  Live Bengaluru clock, 12-hour, with sliding digits ([data-clock])
  js/pal.js                    Pal: asleep 11:00 PM–6:30 AM IST, local-language hello ([data-pal]); ?pal=awake|asleep to preview
  js/reveal.js                 Case studies: title text effect ([data-text-fade]) and in-view reveal
  js/toc.js                    Highlights the case-study contents link in view; on scroll "All work" joins the contents
                               (at 1640px+ both sit in the left margin and "All work" flies there from the top)
  js/peek.js                   "Also check out": desktop preview of a project that trails the pointer on hover
  js/carousel.js               Scroll-snap carousel with pill indicators ([data-carousel])
  js/lightbox.js               Click any screen to enlarge and zoom (.shot img, img[data-zoom])
  favicon.svg
api/
  geo.js                       Vercel function: returns only the visitor's country/state code for Pal's hello
work/
  mailchimp/                   Case study 01, everything for it lives here
    index.html
    mailchimp.css              Styles used only by this case study
    cover.css / cover.js       Logo-in-pixel-dust cover, shared with the homepage card
    mailchimp.js               Process-strip reveal; early-exploration tabs; cart-explorations scroll sequence
                               (carts land in the dashboard's cart slot; the final cart cycles its status
                               header and has a guidance tooltip on its "!" icon)
    img/                       Optimized WebP; *-lg.webp are the sharper lightbox versions;
                               sales-dash*.svg are Krishna's yellow-line dashboards; cart-*/dlg-* are
                               transparent crops placed on them at true scale
  quickbooks-rate-tables/      Case study 02: index.html, quickbooks.css (green accent, diagrams, live table),
                               quickbooks.js (in-view motion + live rate table), img/
  net-terms/                   Case study 03: index.html, net-terms.css (Intuit blue #236CFF, hero, lifecycle,
                               recreated payment widget, email inbox), net-terms.js (hero toggle, apply stepper,
                               widget states, email player), img/ (cleaned Figma exports: prototype buttons and
                               connector arrows removed)
portfolio-context/             Brief, case-study notes, decisions log (local only, not pushed)
```

### Editing guide

| To change… | Open only… |
|---|---|
| MailChimp case study text or images | `work/mailchimp/index.html` (+ `img/`) |
| MailChimp-only visuals (hero dust, channels, tabs, SMS flow, cart sequence, dialogs on the dashboard, spacing) | `work/mailchimp/mailchimp.css` / `.js` |
| Anything shared by all case studies | `assets/css/case-study.css` |
| Colours (both themes), fonts, header, footer | `assets/css/base.css` |
| Pal's lines, greetings or sleep hours | `assets/js/pal.js` |
| Clock | `assets/js/clock.js` + `assets/css/footer-live.css` |
| Home page | `index.html` + `assets/css/home.css` |
| About page (story, experience, education, tools, playlist) | `about/index.html` + `assets/css/about.css` |
| Bangalore strip above the footer (skyline, movers, sky times) | `assets/js/bangalore.js` + the "Bangalore strip" block in `assets/css/footer-live.css` |

### Adding a new case study

1. Copy `work/mailchimp/index.html` into `work/<project>/index.html` and replace the content.
2. Keep the three shared stylesheets/scripts; add `<project>.css` / `.js` only if the project needs bespoke visuals.
3. Put images in `work/<project>/img/` as WebP (1600px wide, plus `-lg` at 2400px for zoom if useful).
4. Add a card to `index.html`.

## Themes

Dark is the default; light follows the visitor's system setting until they use the sun/moon switch in the header, and the choice is remembered across pages (`localStorage.theme`).

- An inline script at the top of each page's `<head>` sets `<html data-theme="dark|light">` before the first paint, so there is no flash. Every new page needs it (copy it from `index.html`).
- Colours live in tokens in `base.css` (`:root` for dark, `:root[data-theme="light"]` for light). Use `var(--ink)`, `var(--line)` and so on, and `rgba(var(--fg), 0.08)` for translucent lines and fills, never a hard-coded white.
- The site accent is neutral. Each case study sets its own project colour on its `<body>` class (`cs-mc`, `cs-qb`, `cs-nt`), with a deeper shade for text in light mode.
- Product screens (screenshots and the recreated QuickBooks UI) stay white in both themes; the lightbox is always dark.

## Plan A / Plan B

The redesign is built on the `plan-a` branch; every push to it gets a private Vercel preview link. `main` (the live site) is untouched until `plan-a` is merged.
The site as it was before the redesign is saved as the git tag `plan-b`. To bring it back:

```bash
git checkout main && git reset --hard plan-b && git push --force-with-lease origin main
```

(Only after confirming that is what you want: it replaces whatever is live.)

## Run locally

```bash
python -m http.server 4321
```

Then open http://localhost:4321.

## Draft markers

`<span class="todo">…</span>` marks a fact or approval still pending. Search for `class="todo"` before launch.

## Deploy

Connected to Vercel: every push to `main` deploys to production. Framework preset **Other**, no build command. Bump the `?v=` version on CSS/JS links whenever those files change.
