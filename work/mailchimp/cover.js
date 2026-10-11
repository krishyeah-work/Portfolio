// cover.js — MailChimp cover: logo floating in pixel dust with subtle cursor parallax.
// Shared by the homepage card and the case-study hero, so both stay in sync.
// Markup: [data-dust] > canvas + .mc-stage__float > svg. Respects prefers-reduced-motion.

(() => {
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-dust]").forEach((stage) => {
  const canvas = stage.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  // MailChimp palette: Cavendish yellow, coconut, cucumber, dragon fruit.
  const palette = [
    ["255,224,27", 0.55],
    ["255,248,226", 0.25],
    ["0,124,137", 0.12],
    ["244,147,170", 0.08],
  ];
  const pick = () => {
    let r = Math.random();
    for (const [c, w] of palette) { if ((r -= w) <= 0) return c; }
    return palette[0][0];
  };

  let w = 0, h = 0, dpr = 1, dots = [], running = false, raf = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const resize = () => {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(320, Math.round((w * h) / 2600));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: 0.25 + Math.random() * 0.75,          // depth: nearer dots move more
      s: Math.random() < 0.82 ? 1 : 2,         // pixel size
      c: pick(),
      a: 0.2 + Math.random() * 0.6,
      vy: -(0.04 + Math.random() * 0.14),
      ph: Math.random() * Math.PI * 2,
    }));
    if (!running) draw(0);
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    for (const d of dots) {
      if (running) {
        d.y += d.vy * d.z;
        d.x += Math.sin(t / 2400 + d.ph) * 0.05;
        if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
      }
      const px = d.x + mouse.x * 16 * d.z;
      const py = d.y + mouse.y * 12 * d.z;
      const tw = 0.65 + 0.35 * Math.sin(t / 900 + d.ph);
      ctx.fillStyle = `rgba(${d.c},${(d.a * tw).toFixed(3)})`;
      ctx.fillRect(Math.round(px), Math.round(py), d.s, d.s);
    }
    stage.style.setProperty("--mx", mouse.x.toFixed(3));
    stage.style.setProperty("--my", mouse.y.toFixed(3));
    if (running) raf = requestAnimationFrame(draw);
  };

  const start = () => { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(draw); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  stage.addEventListener("pointerleave", () => { mouse.tx = 0; mouse.ty = 0; });

  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new ResizeObserver(resize).observe(stage);
});
})();
