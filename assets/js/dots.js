// dots.js — loose dots: the dots on the i's in the Home intro hop a little when the pointer brushes past, and land
// back on their i. Lines below (the strings in the work list), dots above: the same quiet material.
// - The text itself never changes: each "i" stays an "i", so search engines, find-in-page, copying and screen readers all
//   read the intro as written. On top of the font's own dot sit two small circles, placed exactly where the font draws
//   it (measured on a canvas): one in the page colour that hides the real dot, and the dot that moves.
// - Mouse or trackpad only, never with reduced motion. Runs after intro.js, which splits the intro into letters.
// - Nothing runs while the dots are still. To tune the hop: the 0.5 (gravity) in tick() and the clamp in onMove().
// Styles: .tittle in home.css.

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const intro = document.querySelector("[data-ripple]");
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const dots = (() => {
    let items = [], raf = 0, last = null, then = 0, rests = null;
    // where the font draws the dot of an "i": render "i" and a dotless "ı" on a canvas; the dot is what differs
    const geometry = () => {
      const cs = getComputedStyle(intro), S = 200, W = 320, B = 250, X = 60;
      const c = document.createElement("canvas"); c.width = W; c.height = W;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.font = `${cs.fontWeight} ${S}px ${cs.fontFamily}`;
      if (Math.abs(g.measureText("i").width - g.measureText("ı").width) > 1) return null; // no dotless i in this font
      const draw = (ch) => { g.clearRect(0, 0, W, W); g.fillText(ch, X, B); return g.getImageData(0, 0, W, W).data; };
      const a = draw("i"), b = draw("ı");
      let x0 = W, y0 = W, x1 = -1, y1 = -1;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
        const k = (y * W + x) * 4 + 3;
        if (a[k] > 110 && b[k] < 30) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
      if (x1 < 0) return null;
      // across from the letter's start, how wide and tall, and how far above the baseline its top edge sits (all in em)
      return { x: ((x0 + x1 + 1) / 2 - X) / S, rise: (B - y0) / S, w: (x1 - x0 + 1) / S, h: (y1 - y0 + 1) / S };
    };
    const measure = () => { rests = items.map((it) => { const r = it.c.getBoundingClientRect(), d = it.d.getBoundingClientRect(); return { x: d.left + d.width / 2 - it.x, y: d.top + d.height / 2 - it.y, r: r.height }; }); };
    const tick = (t) => {
      const k = Math.min(2.5, (t - (then || t - 16.7)) / 16.7); then = t;
      let busy = false;
      for (const it of items) {
        if (!it.y && !it.vy && Math.abs(it.x) < 0.05 && Math.abs(it.vx) < 0.05) continue;
        it.vy += 0.5 * k; it.y += it.vy * k;
        if (it.y >= 0) { it.y = 0; it.vy = it.vy > 1.4 ? -it.vy * 0.36 : 0; } // lands on the stem, with a small bounce
        it.vx += -it.x * 0.09 * k; it.vx *= Math.pow(0.84, k); it.x += it.vx * k;
        if (Math.abs(it.x) < 0.05 && Math.abs(it.vx) < 0.05) { it.x = 0; it.vx = 0; }
        it.d.style.setProperty("--tx", it.x.toFixed(2) + "px");
        it.d.style.setProperty("--ty", it.y.toFixed(2) + "px");
        if (it.y || it.vy || it.x) busy = true;
      }
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) then = 0;
    };
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      if (!rests) measure();
      const from = last || { x: e.clientX, y: e.clientY };
      const vx = e.clientX - from.x, vy = e.clientY - from.y, speed = Math.hypot(vx, vy);
      last = { x: e.clientX, y: e.clientY };
      if (speed < 1.5) return;
      items.forEach((it, i) => {
        const r = rests[i], reach = r.r * 0.6;
        // the nearest point to this dot on the pointer's path since the last event, so a fast flick still catches it
        const t = clamp(((r.x - from.x) * vx + (r.y - from.y) * vy) / (speed * speed), 0, 1);
        if (Math.hypot(from.x + vx * t - r.x, from.y + vy * t - r.y) > reach) return;
        if (it.y < -0.5 || it.vy < 0) return; // already in the air
        it.vy = -clamp(1.6 + speed * 0.12, 1.8, 4.2); // a brush flicks it up a little; a fast pass, up to about a letter's height
        it.vx += clamp(vx * 0.08, -1.5, 1.5);
        if (!raf) raf = requestAnimationFrame(tick);
      });
    };
    const onLeave = () => { last = null; };
    const onResize = () => { rests = null; };
    return {
      can: () => !!intro && fine && !reduce,
      async on() {
        await document.fonts.ready;
        const G = geometry();
        if (!G || items.length) return;
        // where the baseline sits inside a letter's box, measured on the page itself (font metrics differ by browser):
        // a box with no height, aligned to the baseline, inside the first "i"
        const first = [...intro.querySelectorAll(".c")].find((c) => c.textContent === "i");
        if (!first) return;
        const probe = document.createElement("span");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        first.append(probe);
        const fs = parseFloat(getComputedStyle(first).fontSize), base = (probe.getBoundingClientRect().top - first.getBoundingClientRect().top) / fs;
        probe.remove();
        intro.style.setProperty("--tt-x", G.x + "em"); intro.style.setProperty("--tt-y", (base - G.rise) + "em");
        intro.style.setProperty("--tt-w", G.w + "em"); intro.style.setProperty("--tt-h", G.h + "em");
        items = [...intro.querySelectorAll(".c")].filter((c) => c.textContent === "i").map((c) => {
          c.classList.add("has-tt");
          c.insertAdjacentHTML("beforeend", '<span class="tt-erase" aria-hidden="true"></span><span class="tittle" aria-hidden="true"></span>');
          return { c, d: c.lastChild, x: 0, y: 0, vx: 0, vy: 0 };
        });
        rests = null;
        intro.addEventListener("pointermove", onMove);
        intro.addEventListener("pointerleave", onLeave);
        addEventListener("resize", onResize, { passive: true });
      },
      off() {
        cancelAnimationFrame(raf); raf = 0;
        items.forEach((it) => { it.c.classList.remove("has-tt"); it.c.querySelectorAll(".tt-erase, .tittle").forEach((e) => e.remove()); });
        items = []; rests = null;
        intro.removeEventListener("pointermove", onMove);
        intro.removeEventListener("pointerleave", onLeave);
        removeEventListener("resize", onResize);
      },
    };
  })();


  if (dots.can()) dots.on();
})();
