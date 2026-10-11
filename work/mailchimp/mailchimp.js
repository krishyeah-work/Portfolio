// mailchimp.js — interactions used only by the MailChimp case study.
// Cart explorations: scroll-driven sequence that brings each cart in turn.
// (The logo cover lives in cover.js, shared with the homepage card.)

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Cart explorations sequence ---------- */
(() => {
  const root = document.querySelector("[data-sequence]");
  if (!root || reduceMotion) return;
  const items = [...root.querySelectorAll(".seq__item")];
  const dots = [...root.querySelectorAll(".seq__dot")];
  root.style.setProperty("--n", items.length);
  root.classList.add("is-live");

  let current = -1;
  const setActive = (i) => {
    if (i === current) return;
    current = i;
    items.forEach((el, k) => {
      el.classList.toggle("is-active", k === i);
      el.classList.toggle("is-past", k < i);
    });
    dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
  };

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = root.getBoundingClientRect();
      const stageEl = root.querySelector(".seq__stage");
      const pinTop = parseFloat(getComputedStyle(stageEl).top) || 0;
      const travel = r.height - stageEl.getBoundingClientRect().height;
      const p = Math.max(0, Math.min(0.999, (pinTop - r.top) / (travel || 1)));
      setActive(Math.floor(p * items.length));
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
