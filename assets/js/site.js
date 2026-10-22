// site.js — small enhancements used on every page.
// 1. Text scramble on the name in the header (on hover).
// 2. Animated tabs hover on the top navigation.
// 3. Back-to-top button.
// 4. Images: a soft shimmer while a screen loads, one quiet retry if a request fails (slow or filtered networks).
// 5. Light / dark switch in the header, remembered across pages (the inline <head> script applies it before paint).
// 6. Phone menu: the nav folds behind a menu button below 700px.
// 7. Arrival highlight: after a jump to a section (contents link, nav link, page load with #hash), its heading
//    gets a hand-drawn marker stroke in the project colour that fades away. Groups marked [data-hl-group]
//    highlight their [data-hl] children instead, e.g. the contact links on the homepage.

window.__siteOK = true; // tells the inline guard in <head> that scripts arrived, so scroll-revealed content may stay hidden until it animates in
document.documentElement.classList.add("has-js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Light / dark. The page starts in the saved theme, or the system's if none was chosen.
(() => {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const btn = document.querySelector("[data-theme-toggle]");
  const label = (t) => (t === "light" ? "Switch to dark mode" : "Switch to light mode");
  const apply = (t) => {
    root.dataset.theme = t;
    meta?.setAttribute("content", t === "light" ? "#f6f6f3" : "#0c0c0e");
    if (btn) { btn.setAttribute("aria-label", label(t)); btn.title = label(t); }
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  apply(root.dataset.theme === "light" ? "light" : "dark");
  btn?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.classList.add("theme-anim");
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode: the choice lasts for this page only */ }
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  });
  // follow the system while the visitor hasn't picked a theme themselves
  matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
    if (!saved) apply(e.matches ? "light" : "dark");
  });
})();

// Arrival highlight. A transparent copy of the text sits behind the original, carrying a marker stroke per line
// (box-decoration-break: clone), so the stroke follows the real line breaks and can fade without touching the text.
(() => {
  // two slightly uneven strokes read as a felt-tip marker rather than a box
  const marker = (color) => "url(\"data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'>` +
    `<path d='M3 11 C 46 6, 118 8, 197 5 L 198 31 C 150 35, 64 33, 2 36 Z' fill='${color}'/>` +
    `<path d='M6 8 C 70 4, 140 7, 194 9 L 196 28 C 120 30, 52 31, 4 33 Z' fill='${color}' opacity='0.55'/></svg>`) + "\")";

  // `total` is how long the mark lives, in ms: it draws in, rests, then fades out slowly, gone by `total`
  const mark = (el, total) => {
    if (!el || el.querySelector(":scope > .hl-ghost")) return;
    const color = getComputedStyle(el).getPropertyValue("--hl").trim() || "rgba(128, 128, 128, 0.3)";
    const fade = Math.min(900, total * 0.55);
    const ghost = document.createElement("span");
    ghost.className = "hl-ghost";
    ghost.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "hl-ghost__t";
    text.textContent = el.textContent.replace(/\s+/g, " ").trim();
    text.style.backgroundImage = marker(color);
    ghost.style.transitionDuration = `${fade}ms`;
    ghost.append(text);
    el.classList.add("hl-host");
    el.prepend(ghost);
    void text.offsetWidth; // start from an empty stroke so the draw-in animates
    text.classList.add("is-drawn");
    setTimeout(() => ghost.classList.add("is-fading"), total - fade);
    setTimeout(() => { ghost.remove(); el.classList.remove("hl-host"); }, total + 50);
  };

  // what to highlight for a target: a group's [data-hl] items, else its first heading and the small label above it
  const targetsFor = (el) => {
    if (el.matches("[data-hl-group]")) return [...el.querySelectorAll("[data-hl]")];
    const h = el.matches("h1, h2, h3") ? el : el.querySelector("h2, h3");
    if (!h) return [];
    const label = h.previousElementSibling;
    return label?.matches(".label, .kicker") ? [label, h] : [h];
  };
  const holdFor = (el) => Number(el.dataset.hlTime) || 2500;

  // wait until the page stops scrolling, then mark
  const afterScroll = (fn) => {
    let last = -1, still = 0, tries = 0;
    const check = () => {
      const y = Math.round(window.scrollY);
      still = y === last ? still + 1 : 0;
      last = y;
      if (still >= 3 || tries++ > 40) fn();
      else setTimeout(check, 60);
    };
    setTimeout(check, 80);
  };

  const arrive = (hash) => {
    const id = decodeURIComponent((hash || "").slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    afterScroll(() => targetsFor(el).forEach((t) => mark(t, holdFor(el))));
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === "#main") return;
    arrive(url.hash);
  });
  // arriving from another page with a #hash (for example "Contact" from a case study)
  if (location.hash && location.hash !== "#main") window.addEventListener("load", () => arrive(location.hash));
  window.siteMarkHighlight = mark;
})();

// Phone menu.
(() => {
  const header = document.querySelector(".site-header");
  const btn = header?.querySelector("[data-nav-toggle]");
  const nav = header?.querySelector(".nav");
  if (!btn || !nav) return;
  const set = (open) => {
    header.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  btn.addEventListener("click", () => set(!header.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open")) { set(false); btn.focus(); } });
  document.addEventListener("click", (e) => { if (!header.contains(e.target)) set(false); });
  matchMedia("(min-width: 700px)").addEventListener?.("change", () => set(false));
})();
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>";

// Resolves `el` to `to`, one character at a time, from random glyphs.
function scramble(el, to, { duration = 700, upper = true } = {}) {
  cancelAnimationFrame(el._scr);
  if (reduce) { el.textContent = to; return; }
  const from = el.textContent;
  const len = Math.max(from.length, to.length);
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    let out = "";
    for (let i = 0; i < len; i++) {
      const settle = (i / len) * 0.75 + 0.25;       // later characters settle later
      if (p >= settle) out += to[i] ?? "";
      else if (to[i] === " ") out += " ";
      else {
        const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        out += upper ? g : g.toLowerCase();
      }
    }
    el.textContent = out;
    if (p < 1) el._scr = requestAnimationFrame(tick);
    else el.textContent = to;
  };
  el._scr = requestAnimationFrame(tick);
  // Safety net: whatever happens to animation frames, the final text always lands.
  clearTimeout(el._scrDone);
  el._scrDone = setTimeout(() => { cancelAnimationFrame(el._scr); el.textContent = to; }, duration + 150);
}

// Header name: hover shows "KRISHNA", leaving restores the full name.
// The link keeps the full name's width, so the hover area never shrinks under the cursor
// (otherwise the pointer would "leave" mid-animation and the effect would loop).
document.querySelectorAll("[data-scramble-hover]").forEach((el) => {
  const full = el.textContent.trim();
  const short = el.dataset.scrambleHover;
  const link = el.closest("a") || el;
  const lock = () => { link.style.minWidth = ""; link.style.minWidth = `${Math.ceil(link.getBoundingClientRect().width)}px`; };
  lock();
  document.fonts?.ready.then(lock);
  let shown = full;
  const show = (t, d) => { if (shown === t) return; shown = t; scramble(el, t, { duration: d }); };
  link.addEventListener("pointerenter", () => show(short, 450));
  link.addEventListener("pointerleave", () => show(full, 550));
  link.addEventListener("focus", () => show(short, 450));
  link.addEventListener("blur", () => show(full, 550));
});

// Animated tabs hover: a pill slides between nav links (vanilla take on motion-primitives' AnimatedBackground).
// It rests on the current page's link, if any, and hides when the pointer leaves the nav.
document.querySelectorAll(".nav").forEach((nav) => {
  const links = [...nav.querySelectorAll("a")];
  if (!links.length) return;
  const pill = document.createElement("span");
  pill.className = "nav__pill";
  pill.setAttribute("aria-hidden", "true");
  nav.prepend(pill);
  let hovered = null;
  const rest = () => links.find((a) => a.getAttribute("aria-current") === "page" && a.offsetParent);
  const moveTo = (a, instant) => {
    if (!a) { pill.classList.remove("is-on"); return; }
    if (instant) pill.style.transition = "none";
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.height = `${a.offsetHeight}px`;
    pill.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
    pill.classList.add("is-on");
    if (instant) { pill.offsetWidth; pill.style.transition = ""; }
  };
  links.forEach((a) => {
    a.addEventListener("pointerenter", () => { hovered = a; moveTo(a, !pill.classList.contains("is-on")); });
    a.addEventListener("focus", () => { hovered = a; moveTo(a, !pill.classList.contains("is-on")); });
  });
  nav.addEventListener("pointerleave", () => { hovered = null; moveTo(rest()); });
  nav.addEventListener("focusout", (e) => { if (!nav.contains(e.relatedTarget)) { hovered = null; moveTo(rest()); } });
  const settle = () => moveTo(hovered || rest(), true); // re-measure after fonts load or resize, keeping the hovered tab
  document.fonts?.ready.then(settle);
  window.addEventListener("resize", settle);
  settle();
});

// Back to top.
(() => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.innerHTML = '<span class="to-top__icon" aria-hidden="true">↑</span><span class="to-top__text">Scroll to top</span>';
  document.body.append(btn);
  const footer = document.querySelector(".site-footer");
  const update = () => {
    btn.classList.toggle("is-visible", window.scrollY > 600);
    // lift the button above the footer so it never covers the clock or Pal
    const overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
    btn.style.setProperty("--lift", `${overlap}px`);
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const main = document.getElementById("main");
    if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); }
  });
})();

// Images. Screens sit in white frames, so a slow image used to look like an empty box.
// While a framed image loads its frame shimmers; if a request fails (common behind office proxies)
// it is retried once with a fresh URL, and only then does the frame say it didn't load.
(() => {
  const FRAMES = ".shot, .ver__scroll, .inv__scroll, .mail__scroll";
  document.querySelectorAll("main img[src]").forEach((img) => {
    const frame = img.closest(FRAMES);
    const loaded = () => img.complete && img.naturalWidth > 0;
    if (frame && !loaded()) frame.classList.add("img-wait");
    img.addEventListener("load", () => frame?.classList.remove("img-wait", "img-failed"));
    img.addEventListener("error", () => {
      if (img.dataset.retried) { frame?.classList.remove("img-wait"); frame?.classList.add("img-failed"); return; }
      img.dataset.retried = "1";
      setTimeout(() => {
        const url = new URL(img.getAttribute("src"), location.href);
        url.searchParams.set("retry", Date.now().toString(36));
        img.src = url.href;
      }, 1500);
    });
    // an image that failed before this script ran (complete, but empty) gets its retry now
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("loading") !== "lazy") img.dispatchEvent(new Event("error"));
  });
})();
