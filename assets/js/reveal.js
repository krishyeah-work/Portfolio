// reveal.js — motion used on every case study.
// 1. Title text effect: the case-study title fades in character by character
//    (vanilla take on motion-primitives' TextEffect, per="char", preset="fade").
// 2. In-view reveal: images and text fade in (with a soft blur and scale) as they enter the
//    viewport, with a bottom margin, groups staggering their children (motion-primitives' InView).
// Content already on screen at load is left untouched. Respects prefers-reduced-motion.

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Title text effect ---------- */
  document.querySelectorAll("[data-text-fade]").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    if (reduce) { el.classList.add("tf-ready", "tf-run"); return; }
    let i = 0;
    const wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    text.split(" ").forEach((word, w) => {
      if (w) wrap.append(" ");
      const ws = document.createElement("span");
      ws.className = "tf-word";
      [...word].forEach((ch) => {
        const c = document.createElement("span");
        c.className = "tf-char";
        c.style.setProperty("--i", i++);
        c.textContent = ch;
        ws.append(c);
      });
      wrap.append(ws);
    });
    el.replaceChildren(wrap);
    el.classList.add("tf-ready");
    // start once fonts are ready and the page has painted, so the effect is actually seen
    const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]);
    const run = () => el.classList.add("tf-run");
    fonts.then(() => requestAnimationFrame(() => requestAnimationFrame(run)));
    setTimeout(run, 1600); // safety net: the title always appears, even if frames are throttled
  });

  /* ---------- 2. In-view reveal ---------- */
  if (reduce || !("IntersectionObserver" in window)) return;
  const main = document.querySelector("main");
  if (!main) return;

  const GROUPS = ".overview__grid, .measures-band__list, .pmap__adds, .stats, .params, .figs-2, .flow, .team, .lessons, .duo, .shift, .gr-list, .stack, .copy-list, .channels, .sms-flow";
  const SINGLES = [
    ".cs-section > .label", ".cs-section > h2", ".prose", ".screen__head", ".callout-q", ".carousel", ".round__text",
    ".screen > .shot", ".metrics > .label", ".pmap__col > .label", ".pmap__col > .pcard", ".measures-band__head",
    ".overview > .wrap > .label", ".overview > .wrap > h2", ".next-cs", ".decision", ".outcome__label", ".callout-q",
  ].join(", ");
  const isVisual = (el) => el.matches(".shot, .carousel, .fig, .gr, .param, .pcard, .callout-q") || !!el.querySelector("img");
  const skip = (el) => el.closest(".seq, .toc");
  const belowFold = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.9;

  const units = []; // { el, items }
  main.querySelectorAll(GROUPS).forEach((g) => {
    if (skip(g) || !belowFold(g)) return;
    units.push({ el: g, items: [...g.children] });
  });
  main.querySelectorAll(SINGLES).forEach((el) => {
    if (skip(el) || !belowFold(el) || units.some((u) => u.el.contains(el))) return;
    units.push({ el, items: [el] });
  });

  units.forEach(({ items }) => items.forEach((it, i) => {
    it.dataset.reveal = isVisual(it) ? "visual" : "text";
    if (items.length > 1) it.style.transitionDelay = `${i * 90}ms`;
  }));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const unit = units.find((u) => u.el === entry.target);
      unit?.items.forEach((it) => {
        it.classList.add("is-in");
        it.addEventListener("transitionend", () => { it.style.transitionDelay = ""; }, { once: true });
      });
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  units.forEach((u) => io.observe(u.el));

  // Safety net: anything still hidden when the reader reaches the bottom of the page is shown.
  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((it) => it.classList.add("is-in"));
    }
  }, { passive: true });
})();

/* ---------- Process strip: the steps reveal left to right once, when the strip comes into view ---------- */
document.querySelectorAll("[data-process]").forEach((el) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    el.classList.add("is-in");
    io.disconnect();
  }, { rootMargin: "0px 0px -15% 0px" });
  io.observe(el);
});
