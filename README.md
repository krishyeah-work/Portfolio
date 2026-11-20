# Krishna Revanth — Portfolio

Static HTML, CSS and a little vanilla JS. No framework, no build step. Visits are counted with Vercel Web Analytics (no cookies).

## Structure

Every page and every project is self-contained, so an edit only touches the files for that page.

```
index.html                     Home: the intro and ways to reach me, four featured case studies, "All work →"
work/index.html                Work: every project in one list, newest first, with tabs (All, At Intuit, Experiments, At IIT Guwahati)
about/index.html               About: a short hello and photo, the "Away from the screen" ring, experience and education, playlist
404.html
assets/
  css/base.css                 Shared: tokens (light and dark themes), type, header and phone menu, footer, buttons, screenshot frame,
                               and the header glide between pages (a cross-document view transition)
                               Sizes are in rem; with a mouse or trackpad 1rem is 11px up to 1440px wide, 13px at 1920px, 15px from 2400px
  css/home.css                 Home and the Work page: one narrow column for header, content and footer (--max); the intro,
                               the loose dots, the ways to reach me, the work rows and their hover previews, the strings, the Work page tabs
  css/notes.css                Handwritten notes (.note) and pen strokes (.ink). --font-hand sets the hand, --pen the ink. Home has one note
  css/about.css                About page only
  css/case-study.css           Shared case-study layout and components (carousel, lightbox, toc, reveal, "Also check out"…)
  css/work-art.css             Project colours and the small animated pieces for Mailchimp (a dashboard, also the case-study hero),
                               QuickBooks, Net Terms, Picto and TEDxIITGuwahati (Home hover previews + "Also check out")
  css/footer-live.css          Footer: clock (left), Pal (centre), "Looking to contact" (right). (Its Bangalore strip rules are unused now.)
  js/site.js                   Every page: name scramble, nav hover pill, scroll-to-top, image retry,
                               light/dark switch, phone menu, arrival highlight (marker on the heading you
                               jumped to; colour from --hl; [data-hl-group] + [data-hl] for groups of links),
                               and the header glide between pages for browsers without view transitions
  js/bangalore.js              (Not loaded by any page since 13 Nov 2026; kept for a later Play page.) Bangalore, painted like Van Gogh on one canvas: the sky in rows of brush marks along a
                               flow (whirls, rings round the sun or moon), every building and surface in marks lit from the upper right,
                               Cubbon Park beside Vidhana Soudha; people, animals and vehicles outlined in Prussian blue and painted in
                               brush marks, drawn once into small images; headlamps light the road after dark. The pointer paints a stroke
                               that fades into the wind; the marks it nudges flow back in ~3 s. Light theme = day, dark = Starry Night
  js/intro.js                  Home intro: words come into focus one after another, once per visit (about 1.5 s); letters near
                               the pointer thicken along that line (mouse only); on Home the name scrolls to the top instead of
                               reloading; Email hover copies the address
  js/work-filter.js            Work page tabs: show all projects or one group, with motion; #intuit / #experiments open a tab
  js/dots.js                   Home intro: the dots on the i's hop when the pointer brushes past (mouse only). The text never changes:
                               a page-coloured circle hides the font's dot and a moving one sits on top. Styles: .tt-erase, .tittle in home.css
  js/strings.js                Home and Work lists: the lines between rows are strings that pluck when the pointer crosses them
                               (mouse only, off for reduced motion). PULL, RING and PITCH at the top tune the feel
  js/about.js                  About page: the entrance (photo in the middle, then into place), the travel ring (turns, stops on hover, drag to spin; the caption scrambles), its viewer
                               (photos grow out of the ring and slide sideways), the Spotify player (on "Listen here")
  js/clock.js                  Live Bengaluru clock, 12-hour, with sliding digits ([data-clock])
  js/pal.js                    Pal: asleep 11:00 PM–6:30 AM IST, local-language hello ([data-pal]); ?pal=awake|asleep to preview
  js/reveal.js                 Case studies: title text effect ([data-text-fade]) and in-view reveal
  js/toc.js                    Highlights the case-study contents link in view; on scroll "All work" joins the contents
                               (at 1640px+ both sit in the left margin and "All work" flies there from the top)
  js/peek.js                   "Also check out": desktop preview of a project that trails the pointer on hover
  js/carousel.js               Case-study carousels: swipe, arrow keys, pills, and a small ‹ 1 / 5 › pager beside them
  js/lightbox.js               Click any screen to enlarge and zoom (.shot img, img[data-zoom])
  favicon.svg
  og.png                       Share image for link previews (1200×630: name, "a designer.", krishyeah.com); every page points to it
api/
  geo.js                       Vercel function: returns only the visitor's country/state code for Pal's hello
work/
  mailchimp/                   Case study 01, everything for it lives here
    index.html
    mailchimp.css              Styles used only by this case study
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
  picto/                       Case study 04 (an experiment of my own), on the shared case-study template: index.html, picto.css (Picto blue),
                               picto.js (clips play only while on screen; pause buttons), media/ (WebM clips recorded from the
                               live prototype + a still poster each), img/phone.webp. Prototype: krishyeah-work.github.io/seen/
  tedx-iitg/                   Case study 05, the TEDxIITGuwahati 2025 identity (IIT Guwahati, Jan – Feb 2025), in Krishna's own
                               words: hero (logo reveal) → overview (the event, facts, results) → 01 the theme wordmark over the
                               waves footage → 02 sketches, sun/citadel/waves, construction grid, colour, type → 03 collaterals
                               (social, on the day, merch; web = the event website redesigned and played as motion in a browser window)
                               → a dark closing card in the column (photos from the day, thank-you, signature).
                               tedx.css (TEDx red; the dark "stage"), tedx.js (reveal, pointer wash, parts and grid drawing in,
                               the looping mark, the website animation, swatches that copy, clips that play on screen, the signature
                               writing in).
                               The logo is his Figma SVG; the wordmark and TEDx name are traced from his exports; all kept once
                               in a hidden <svg> at the top of <main> and placed with <use>. media/ (waves + sketch timelapse,
                               WebM/MP4 from his After Effects files), img/ (mockups as WebP, *-lg for zoom; type-*.svg specimens;
                               event.webp + signature.svg from his old results frame). Raw exports stay local in
                               "Old files for TedX_IiTG/" (ignored by git)
lab/                           Experiments, on this computer only (ignored by git, never deployed): see lab/README.md
portfolio-context/             Brief, case-study notes, decisions log (local only, not pushed)
```

### Editing guide

| To change… | Open only… |
|---|---|
| Mailchimp case study text or images | `work/mailchimp/index.html` (+ `img/`) |
| Mailchimp-only visuals (channels, tabs, SMS flow, cart sequence, dialogs on the dashboard, spacing) | `work/mailchimp/mailchimp.css` / `.js` |
| TEDxIITGuwahati text, mockups or clips | `work/tedx-iitg/index.html` (+ `img/`, `media/`) |
| TEDxIITGuwahati motion (reveal timing, wash strength, the looping mark, grid) | `work/tedx-iitg/tedx.css` (keyframes) / `tedx.js` |
| The Mailchimp dashboard animation (Home preview, "Also check out", the case study's hero) | the `.mcx` markup in each page + "Mailchimp art" in `assets/css/work-art.css` |
| The share image | `assets/og.png` (made from a small HTML card; keep 1200×630) |
| Anything shared by all case studies | `assets/css/case-study.css` |
| Colours (both themes), fonts, header, footer | `assets/css/base.css` |
| Pal's lines, greetings or sleep hours | `assets/js/pal.js` |
| Clock | `assets/js/clock.js` + `assets/css/footer-live.css` |
| Home page | `index.html` + `assets/css/home.css` |
| How the header glides between pages (timing, which parts move) | "moving between pages" in `assets/css/base.css`; the fallback is the last block of `assets/js/site.js` |
| Work page: every project in one list, newest first, with tabs (All, At Intuit, Experiments, At IIT Guwahati) | `work/index.html` (each row's `data-group`; the counts in the tabs) + `assets/js/work-filter.js` + `assets/css/home.css` ("the Work page" section). Adding a case study: add its row there with its group, update the tab counts, and copy it to Home if featured |
| A work row on Home: title, dates, and the preview beside it (animation, one-line summary, tags) | the `<li>` in `index.html`; the animations are in `assets/css/work-art.css` |
| Handwritten notes (wording in the page's HTML; the hand and ink colour in the CSS) | the page's HTML + `assets/css/notes.css` |
| About page (hello, photos, the travel ring and its captions, the record, playlist) | `about/index.html` (+ `assets/img/about/`; originals in `01/`, not published), `assets/css/about.css` |
| Bangalore strip (not on any page since 13 Nov 2026; kept for a Play page) | `assets/js/bangalore.js` (sections are headed `// ----------`); its height is the "Bangalore strip" block in `assets/css/footer-live.css` |

### Adding a new case study

1. Copy a case study's `index.html` (Picto's is the shortest) into `work/<project>/index.html` and replace the content.
   Keep the head as it is: the theme script, the share-image tags and the Vercel Analytics lines.
2. Keep the shared stylesheets/scripts; add `<project>.css` / `.js` only if the project needs bespoke visuals.
3. Put images in `work/<project>/img/` as WebP (1600px wide, plus `-lg` at 2400px for zoom if useful).
4. Add its row to `work/index.html` with the right `data-group`, and update the counts in the tabs.
5. To feature it on Home, copy the row into `index.html` (Home keeps four or five).

## Themes

Light is the default; the sun/moon switch in the header turns dark on, and the choice is remembered across pages (`localStorage.theme`).

- An inline script at the top of each page's `<head>` sets `<html data-theme="dark|light">` before the first paint, so there is no flash. Every new page needs it (copy it from `index.html`).
- Colours live in tokens in `base.css` (`:root` for dark, `:root[data-theme="light"]` for light; light is what visitors get first). Use `var(--ink)`, `var(--line)` and so on, and `rgba(var(--fg), 0.08)` for translucent lines and fills, never a hard-coded white.
- The site accent is neutral. Each case study sets its own project colour on its `<body>` class (`cs-mc`, `cs-qb`, `cs-nt`, `cs-pc`), with a deeper shade for text in light mode.
- Product screens (screenshots and the recreated QuickBooks UI) stay white in both themes; the lightbox is always dark.

## Versions

The current site (the quiet, light redesign, built on the `v3` branch) went live on 16 Nov 2026. Earlier live versions are kept as git tags:

| Tag | What it is |
|---|---|
| `v2-2026-11-10` | The site live from 26 Oct to 16 Nov 2026 (dark, Van Gogh Bangalore footer) |
| `plan-b` | The site before the October redesign (also branch `archive/v1`) |

To bring one back (only after confirming that is what you want: it replaces whatever is live):

```bash
git checkout main && git reset --hard v2-2026-11-10 && git push --force-with-lease origin main
```

## Run locally

```bash
python -m http.server 4321
```

(`.claude/serve.py` is the same server with caching turned off, so every reload shows the latest edit.)

Then open http://localhost:4321.

## Draft markers

`<span class="todo">…</span>` marks a fact or approval still pending. Search for `class="todo"` before launch.

## Deploy

Connected to Vercel: every push to `main` deploys to production. Framework preset **Other**, no build command. Bump the `?v=` version on CSS/JS links whenever those files change.
