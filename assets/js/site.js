// site.js — small enhancements used on every page.
// 1. Text scramble on the name in the header (on hover).
// 2. Animated tabs hover on the top navigation.
// 3. Back-to-top button.
// 4. Images: a soft shimmer while a screen loads, one quiet retry if a request fails (slow or filtered networks).

window.__siteOK = true; // tells the inline guard in <head> that scripts arrived, so scroll-revealed content may stay hidden until it animates in
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
