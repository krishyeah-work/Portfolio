// site.js — small enhancements used on every page.
// 1. Text scramble: the name in the header (on hover) and case-study titles (on load).
// 2. Back-to-top button.

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

// Case-study titles: shown scrambled straight away, then resolved once fonts are ready and the
// page has painted, so the effect is visible even on slower connections.
document.querySelectorAll("[data-scramble-load]").forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  if (reduce) return;
  el.textContent = [...text].map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0].toLowerCase())).join("");
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]);
  const start = () => requestAnimationFrame(() => setTimeout(() => scramble(el, text, { duration: 1400, upper: false }), 150));
  fontsReady.then(() => (document.hidden ? document.addEventListener("visibilitychange", start, { once: true }) : start()));
});

// Back to top.
(() => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.append(btn);
  const update = () => btn.classList.toggle("is-visible", window.scrollY > 600);
  window.addEventListener("scroll", update, { passive: true });
  update();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const main = document.getElementById("main");
    if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); }
  });
})();
