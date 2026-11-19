// tedx.js — motion on the TEDxIITGuwahati case study. The pieces are SVG drawn in the page (see tedx.css).
// - Hero: the logo reveal plays once when the page opens (about 4.5 s), then rests on the logo; "Replay" plays it again.
//   The wash that takes the wordmark is an SVG displacement filter, on only while the wave passes.
// - Theme: the wordmark sits over the waves footage; sweep the pointer across it and it ripples like water, harder the
//   faster you move, then settles.
// - The closing band: the signature writes itself in, left to right.
// - Sun / citadel / waves, the construction grid: they draw in when they come on screen.
// - The mark coming together loops only while it's on screen. The grid has a button to switch to colour.
// - Colour swatches copy their hex code. The two clips play only while on screen, each with a pause button.
// With reduced motion nothing moves by itself: everything rests in its final place and the clips show a still.

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const onView = (els, fn, opts = { threshold: 0.35 }) => {
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => fn(e.target, e.isIntersecting, e)), opts);
    els.forEach((el) => io.observe(el));
  };

  // a displacement filter whose strength we drive by hand
  const washer = (filter) => {
    const disp = filter && filter.querySelector("feDisplacementMap");
    const turb = filter && filter.querySelector("feTurbulence");
    return {
      set(scale, t = 0) {
        if (!disp) return;
        disp.setAttribute("scale", scale.toFixed(1));
        if (turb) turb.setAttribute("baseFrequency", `${(0.006 + 0.002 * Math.sin(t / 700)).toFixed(4)} ${(0.028 + 0.006 * Math.cos(t / 900)).toFixed(4)}`);
      },
    };
  };

  // ---------- hero: the reveal ----------
  const hero = document.querySelector("[data-tx-hero]");
  if (hero) {
    const wm = hero.querySelector(".txh-wash");
    const filterId = wm && wm.dataset.filter;
    const wash = washer(filterId && document.getElementById(filterId));
    const btn = hero.querySelector(".tx-btn");
    let raf = 0, timers = [];
    const stopWash = () => { cancelAnimationFrame(raf); wash.set(0); wm && wm.removeAttribute("filter"); };
    const play = () => {
      timers.forEach(clearTimeout); timers = []; stopWash();
      hero.classList.remove("is-play", "is-done");
      void hero.offsetWidth; // restart the CSS animations
      hero.classList.add("is-play");
      // the wave: from 1.55 s the wordmark warps harder and harder for ~1.1 s, then the filter comes off
      timers.push(setTimeout(() => {
        if (!wm) return;
        wm.setAttribute("filter", `url(#${filterId})`);
        const t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / 1100);
          wash.set(140 * k * k, now);
          if (k < 1) raf = requestAnimationFrame(step); else stopWash();
        };
        raf = requestAnimationFrame(step);
      }, 1550));
      timers.push(setTimeout(() => hero.classList.add("is-done"), 4600));
    };
    if (reduce) hero.classList.add("is-still", "is-done");
    else {
      let played = false;
      onView([hero], (el, inView) => { if (inView && !played) { played = true; play(); } }, { threshold: 0.3 });
      // safety: if the observer never fires (old browser), show the logo
      setTimeout(() => { if (!played) hero.classList.add("is-still"); }, 2500);
    }
    btn && btn.addEventListener("click", () => { hero.classList.remove("is-still"); play(); });
  }

  // ---------- theme: wash the wordmark with the pointer ----------
  $$("[data-tx-wash]").forEach((stage) => {
    if (reduce) return;
    const g = stage.querySelector(".txw");
    const id = g && g.dataset.filter;
    const wash = washer(id && document.getElementById(id));
    if (!g) return;
    let target = 0, cur = 0, raf = 0, last = null;
    const tick = (now) => {
      cur += (target - cur) * 0.18;
      target *= 0.9;                       // the sea lets go
      if (cur < 0.4 && target < 0.4) { cur = target = 0; wash.set(0); g.removeAttribute("filter"); raf = 0; return; }
      wash.set(cur, now);
      raf = requestAnimationFrame(tick);
    };
    stage.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (last) {
        const dt = Math.max(8, now - last.t);
        const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px per ms
        const w = stage.clientWidth || 800;
        target = Math.min(120, target + speed * (900 / w) * 22);
      }
      last = { x: e.clientX, y: e.clientY, t: now };
      if (!raf) { g.setAttribute("filter", `url(#${id})`); raf = requestAnimationFrame(tick); }
    });
    stage.addEventListener("pointerleave", () => { last = null; });
  });

  // ---------- sun / citadel / waves, and the grid: draw in on screen ----------
  // (pointing at a part only eases it a little way, in CSS)
  onView($$(".tx-parts"), (el, inView) => { if (inView) el.classList.add("is-in"); }, { threshold: 0.4 });
  const grids = $$(".tx-grid");
  onView(grids, (el, inView) => { if (inView) el.classList.add("is-in"); }, { threshold: 0.4 });
  grids.forEach((grid) => {
    const btn = grid.querySelector(".tx-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const on = grid.classList.toggle("is-colour");
      btn.setAttribute("aria-pressed", String(on));
      btn.querySelector("span").textContent = on ? "Show the grid" : "Show in colour";
    });
  });

  // ---------- the closing band: the signature writes itself in once it's on screen ----------
  onView($$(".tx-end"), (el, inView) => { if (inView) el.classList.add("is-in"); }, { threshold: 0.45 });

  // ---------- the mark coming together: loop only while on screen ----------
  if (!reduce) onView($$(".tx-moving"), (el, inView) => el.classList.toggle("is-run", inView), { threshold: 0.2 });

  // ---------- swatches: copy the hex code ----------
  $$(".tx-sw").forEach((sw) => {
    const hex = sw.querySelector(".tx-sw__hex");
    let t = 0;
    sw.addEventListener("click", async () => {
      const code = sw.dataset.hex;
      try { await navigator.clipboard.writeText(code); } catch (e) { return; }
      clearTimeout(t); sw.classList.add("is-copied"); hex.textContent = "Copied " + code;
      t = setTimeout(() => { sw.classList.remove("is-copied"); hex.textContent = code; }, 1400);
    });
  });

  // ---------- clips: play while on screen, with a pause button ----------
  const vids = $$("video[data-play]");
  if (vids.length) {
    if (reduce) vids.forEach((v) => { v.controls = true; v.preload = "none"; });
    else {
      const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
      const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';
      const stopped = new WeakSet();
      vids.forEach((v) => {
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "tx-btn";
        const set = (paused) => { btn.innerHTML = paused ? PLAY : PAUSE; btn.setAttribute("aria-label", paused ? "Play the clip" : "Pause the clip"); btn.setAttribute("aria-pressed", String(paused)); };
        set(false);
        btn.addEventListener("click", () => {
          if (v.paused) { stopped.delete(v); v.play().catch(() => {}); set(false); }
          else { stopped.add(v); v.pause(); set(true); }
        });
        v.parentElement.append(btn);
      });
      onView(vids, (v, inView, e) => {
        if (inView && e.intersectionRatio >= 0.35) {
          if (v.preload !== "auto") v.preload = "auto";
          if (!stopped.has(v)) v.play().catch(() => {});
        } else v.pause();
      }, { threshold: [0, 0.35] });
    }
  }
})();
