// intro.js — the homepage intro ([data-ripple]) and the ways to reach me.
// - On load the words come into focus one after another (home.css). On the first visit in a session, the nav and the
//   work wait while the intro is read, then come into view; scrolling or a key press brings them in at once.
// - With a mouse or trackpad, letters near the pointer thicken in a soft swell along that line only and ease back as
//   it moves on. They thicken with an outline stroke, which never changes their width, so nothing around them moves.
// - Hovering Email shows the address with a Copy button.
// Holds still for reduced motion.

(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- first visit: let the intro breathe before the nav and the work arrive ----------
  try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
  if (root.classList.contains("first-visit")) {
    const kinds = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"];
    const show = (quick) => {
      if (root.classList.contains("intro-ready")) return;
      root.classList.toggle("intro-quick", quick);
      root.classList.add("intro-ready");
      kinds.forEach((k) => removeEventListener(k, now, true));
      setTimeout(() => root.classList.remove("first-visit", "intro-ready", "intro-quick"), quick ? 600 : 1700);
    };
    const now = () => show(true);
    kinds.forEach((k) => addEventListener(k, now, { capture: true, passive: true }));
    setTimeout(() => show(false), 2600); // the intro takes about 2s to come in, then a short pause
  }

  // ---------- "Selected work" cue: shown at the top of the page, gone once you scroll ----------
  if (document.querySelector(".peek-cue")) {
    const scrolled = () => root.classList.toggle("is-scrolled", scrollY > 40);
    scrolled();
    addEventListener("scroll", scrolled, { passive: true });
  }

  // ---------- copy the email address ----------
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    let timer = 0;
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try { await navigator.clipboard.writeText(value); }
      catch (e) {
        const field = Object.assign(document.createElement("textarea"), { value });
        field.style.cssText = "position:fixed;opacity:0";
        document.body.append(field); field.select(); document.execCommand("copy"); field.remove();
      }
      btn.textContent = "Copied";
      btn.classList.add("is-done");
      clearTimeout(timer);
      timer = setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 1600);
    });
  });

  // ---------- the intro paragraph ----------
  const text = document.querySelector("[data-ripple]");
  if (!text) { root.classList.remove("intro-wait"); return; }
  const ripple = matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce;

  // wrap each word (and, for the ripple, each letter) in a span; links, spaces and line breaks stay as they are
  const letters = [];
  let words = 0;
  const split = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 1) { split(child); continue; }
      if (child.nodeType !== 3 || !child.textContent.trim()) continue;
      const frag = document.createDocumentFragment();
      for (const part of child.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.className = "w";
        w.style.setProperty("--wi", words++);
        if (ripple) {
          for (const ch of part) { const c = document.createElement("span"); c.className = "c"; c.textContent = ch; w.append(c); letters.push(c); }
        } else w.textContent = part;
        frag.append(w);
      }
      child.replaceWith(frag);
    }
  };
  split(text);
  root.classList.remove("intro-wait");
  if (!ripple) return;

  // where each letter sits, relative to the text block, grouped into lines
  let boxes = null, lines = [];
  const layout = () => {
    const base = text.getBoundingClientRect(), byLine = new Map();
    boxes = letters.map((c) => {
      const r = c.getBoundingClientRect(), line = Math.round(r.top - base.top);
      byLine.set(line, (r.top + r.bottom) / 2 - base.top);
      return { x: r.left - base.left + r.width / 2, line };
    });
    lines = [...byLine];
  };

  const now = new Float32Array(letters.length), aim = new Float32Array(letters.length);
  let line = null, px = 0, raf = 0, last = 0;
  const target = () => {
    const spread = parseFloat(getComputedStyle(text).fontSize) * 1.5; // the swell reaches about three letters either side
    for (let i = 0; i < letters.length; i++) aim[i] = boxes[i].line === line ? Math.exp(-(((boxes[i].x - px) / spread) ** 2)) : 0;
  };
  const tick = (t) => {
    const ease = 1 - Math.pow(0.86, Math.min(4, (t - (last || t - 16.7)) / 16.7)); // same feel at 60 and 120 frames a second
    last = t;
    let busy = false;
    for (let i = 0; i < letters.length; i++) {
      const d = aim[i] - now[i];
      if (!d) continue;
      if (Math.abs(d) < 0.004) now[i] = aim[i];
      else { now[i] += d * ease; busy = true; }
      if (now[i]) letters[i].style.setProperty("--t", now[i].toFixed(3));
      else letters[i].style.removeProperty("--t");
    }
    raf = busy ? requestAnimationFrame(tick) : 0;
    if (!busy) last = 0;
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(tick); };

  text.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    if (!boxes) layout();
    const r = text.getBoundingClientRect(), y = e.clientY - r.top;
    px = e.clientX - r.left;
    let best = Infinity;
    for (const [key, mid] of lines) if (Math.abs(mid - y) < best) { best = Math.abs(mid - y); line = key; }
    target();
    run();
  });
  text.addEventListener("pointerleave", () => { line = null; if (boxes) { target(); run(); } });
  const refresh = () => { boxes = null; };
  document.fonts?.ready.then(refresh); // positions change once Geist has loaded
  window.addEventListener("resize", refresh, { passive: true });
})();
