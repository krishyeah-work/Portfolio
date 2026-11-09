// about.js — the About page: the entrance, the travel ring and its viewer, and the playlist card.
// Spotify's player (and its cookies) loads only when someone presses "Listen here"; until then the card is a local
// image and a button, so the page stays light.

(() => {
  const card = document.querySelector("[data-spotify]");
  const btn = card?.querySelector("[data-spotify-play]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.className = "tune__frame";
    frame.src = `https://open.spotify.com/embed/playlist/${card.dataset.spotify}?utm_source=generator&theme=0`;
    frame.title = "Spotify player: krishyeah playlist";
    frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    card.replaceWith(frame);
    frame.focus(); // the button is gone, so keyboard users continue from the player rather than the top of the page
  });
})();


// the entrance: my photo fades in at the centre beside "I'm Krishna.", then slides across into its place while the rest
// of the hello arrives a word at a time and the page below rises in. Skipped for people who'd rather things didn't move,
// and when the visit lands on a part of the page further down.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("is-arriving")) return;
  const photo = document.querySelector(".hello .snap"), copy = document.querySelector(".hello__copy"), links = document.querySelector(".hello__links");
  if (!photo || !copy) { root.classList.remove("is-arriving"); return; }
  const words = [];
  copy.querySelectorAll("p").forEach((p) => { // each word its own span; the text reads the same
    const parts = p.textContent.split(/(\s+)/);
    p.textContent = "";
    for (const part of parts) {
      if (!part.trim()) { p.append(part); continue; }
      const w = document.createElement("span");
      w.className = "w";
      w.textContent = part;
      p.append(w);
      words.push(w);
    }
  });
  const img = photo.querySelector("img"), wait = (ms) => new Promise((r) => setTimeout(r, ms));
  Promise.race([Promise.all([img.decode().catch(() => {}), document.fonts?.ready]), wait(700)]).then(() => {
    root.classList.remove("is-arriving");
    const r = photo.getBoundingClientRect(), box = photo.closest(".wrap").getBoundingClientRect();
    const dx = box.left + box.width / 2 - (r.left + r.width / 2), at = `translateX(${dx.toFixed(1)}px)`;
    const OUT = "cubic-bezier(0.2, 0.7, 0.1, 1)", GLIDE = "cubic-bezier(0.65, 0, 0.2, 1)";
    photo.animate([
      { opacity: 0, transform: `${at} scale(0.94)`, easing: OUT },
      { opacity: 1, transform: `${at} scale(1)`, offset: 0.34 },
      { opacity: 1, transform: `${at} scale(1)`, offset: 0.46, easing: GLIDE },
      { opacity: 1, transform: "none" },
    ], { duration: 1800 });
    const rise = (el, delay, dur = 520, y = 8) => el.animate([{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }], { duration: dur, delay, easing: OUT, fill: "backwards" });
    words.forEach((w, i) => rise(w, i < 2 ? 250 + i * 90 : 1000 + (i - 2) * 14)); // "I'm Krishna." first, the rest once the photo moves
    if (links) rise(links, 1000 + words.length * 14);
    document.querySelectorAll(".away, .about-more").forEach((el, i) => rise(el, 1650 + i * 150, 800, 18));
  });
})();

// the travel ring: thumbnails on a circle, turning slowly; the ones at the back are smaller, higher and fainter. Each
// photo sits on the ring twice (the second copy hidden from screen readers and the keyboard) so there's no gap.
// Point at a card (or tab to it) and the ring stops and that card lights up; drag to spin it. Click it and it grows
// out of the ring into the full photo; arrows, swipes or the scroll wheel slide sideways to the next; closing flies it
// back into its place. Not for people who'd rather things didn't move: then nothing turns or flies, and loops wait.
(() => {
  const ring = document.querySelector("[data-ring]");
  const viewer = document.querySelector("[data-viewer]");
  if (!ring || !viewer) return;
  const list = ring.querySelector(".ring__list"), cap = ring.querySelector("[data-ring-cap]"), calm = matchMedia("(prefers-reduced-motion: reduce)");
  const firsts = [...list.children], n = firsts.length, cards = firsts.map((li) => li.querySelector("button"));
  const items = cards.map((c) => ({ ...c.dataset, w: +c.dataset.w, h: +c.dataset.h }));
  firsts.forEach((li) => {
    const twin = li.cloneNode(true);
    twin.setAttribute("aria-hidden", "true");
    twin.querySelector("button").tabIndex = -1;
    list.append(twin);
  });
  const slots = [...list.children], m = slots.length, STEP = (Math.PI * 2) / m, SPEED = (Math.PI * 2) / 80; // one turn every 80 s
  const vids = slots.map((li) => li.querySelector("video"));
  let theta = 0, speed = 0, lit = -1, hovered = -1, goal = null, seen = false, open = false, raf = 0, last = 0, drag = null, moved = false, capText = "";
  const glow = slots.map(() => 0);
  ring.classList.add("is-on");

  // the caption under the ring settles into the next name from random letters
  const scramble = (el, to, duration = 560) => {
    cancelAnimationFrame(el._scr);
    clearTimeout(el._done);
    if (calm.matches || !el.textContent) { el.textContent = to; return; }
    const len = Math.max(el.textContent.length, to.length), start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = to[i] ?? "";
        if (p >= (i / len) * 0.7 + 0.3 || ch === " " || ch === ",") out += ch;
        else out += "abcdefghijklmnopqrstuvwxyz"[(Math.random() * 26) | 0];
      }
      el.textContent = out;
      if (p < 1) el._scr = requestAnimationFrame(tick);
    };
    el._scr = requestAnimationFrame(tick);
    el._done = setTimeout(() => { cancelAnimationFrame(el._scr); el.textContent = to; }, duration + 150); // the name always lands
  };

  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const radius = () => Math.min(ring.clientWidth * 0.46, slots[0].offsetWidth * 2.4);
  const toFront = (i) => { // the copy of photo i nearest the front, brought round to it
    const a = wrap(-i * STEP - theta), b = wrap(-(i + n) * STEP - theta);
    return theta + (Math.abs(a) < Math.abs(b) ? a : b);
  };
  let front = 0;
  const place = () => {
    const R = radius(), cw = slots[0].offsetWidth, lift = cw * 0.46, moving = seen && !open && !calm.matches;
    let best = -2;
    slots.forEach((li, i) => {
      const a = theta + i * STEP, s = Math.sin(a), c = Math.cos(a), t = (c + 1) / 2, k = glow[i];
      if (c > best) { best = c; front = i; }
      const scale = (0.55 + 0.45 * t) * (1 + 0.08 * k);
      li.style.transform = `translate(-50%, -50%) translate3d(${(s * R).toFixed(1)}px, ${(-(1 - t) * lift).toFixed(1)}px, 0) scale(${scale.toFixed(3)}) perspective(1000px) rotateY(${(s * 34 * (1 - k)).toFixed(1)}deg)`;
      li.style.opacity = Math.min(1, 0.1 + 0.9 * t * t + 0.4 * k).toFixed(3);
      li.style.zIndex = String(Math.round(t * 100) + (k > 0.5 ? 200 : 0));
      const v = vids[i]; // only the loops facing you play
      if (v) { if (moving && t > 0.4 && v.paused) v.play().catch(() => {}); else if ((!moving || t < 0.3) && !v.paused) v.pause(); }
    });
    const text = items[(lit >= 0 ? lit : front) % n].cap;
    if (text !== capText) { capText = text; scramble(cap, text); }
  };
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const want = lit >= 0 || drag || calm.matches || goal !== null ? 0 : SPEED;
    speed += (want - speed) * Math.min(1, dt * (want ? 2 : 9)); // starts gently, stops quickly
    if (!want && Math.abs(speed) < 0.003) speed = 0;
    if (goal !== null) { const d = wrap(goal - theta); theta += d * Math.min(1, dt * 6); if (Math.abs(d) < 0.002) { theta = goal; goal = null; } }
    else if (!drag) theta += speed * dt;
    let busy = speed !== 0 || goal !== null || !!drag;
    slots.forEach((_, i) => { const t = i === lit ? 1 : 0, d = t - glow[i]; if (Math.abs(d) > 0.002) { glow[i] += d * Math.min(1, dt * 8); busy = true; } else glow[i] = t; });
    place();
    raf = seen && !open && (busy || !calm.matches) ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => { if (!raf && seen && !open) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const light = (i) => { if (lit >= 0) slots[lit].classList.remove("is-lit"); lit = i; if (i >= 0) slots[i].classList.add("is-lit"); wake(); };

  new IntersectionObserver(([e]) => { seen = e.isIntersecting; place(); wake(); }, { rootMargin: "100px" }).observe(ring);
  addEventListener("resize", () => { place(); if (viewer.open) { layout(); paint(); } });
  place();

  // a photo's full version starts loading as soon as the pointer rests on it, so it opens sharp
  const preload = (i) => { const d = items[i]; if (d.pre) return; d.pre = true; new Image().src = d.kind === "video" ? d.posterFull : d.full; };

  slots.forEach((li, i) => {
    const card = li.querySelector("button");
    card.addEventListener("pointerenter", (e) => { preload(i % n); if (e.pointerType === "mouse" && !drag) { hovered = i; light(i); } });
    card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovered = -1; if (lit === i) light(-1); } });
    card.addEventListener("pointerdown", () => preload(i % n));
    card.addEventListener("focus", () => { if (card.matches(":focus-visible")) { goal = toFront(i); light(i); } }); // keyboard: bring it to the front
    card.addEventListener("blur", () => { if (lit === i && hovered !== i) light(-1); });
    card.addEventListener("click", (e) => { if (moved) { e.preventDefault(); return; } show(i % n, li); });
  });

  // drag (or swipe) to spin it
  ring.addEventListener("pointerdown", (e) => { if (e.button) return; drag = { x: e.clientX, theta, t: performance.now(), v: 0 }; moved = false; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) { moved = true; ring.classList.add("is-dragging"); light(-1); goal = null; }
    const now = performance.now(), next = drag.theta + dx / radius();
    drag.v = (next - theta) / Math.max(0.001, (now - drag.t) / 1000);
    drag.t = now;
    theta = next;
    wake();
  });
  const release = () => {
    if (!drag) return;
    if (moved && !calm.matches) speed = Math.max(-3, Math.min(3, drag.v)); // a flick keeps it turning, then it settles back
    drag = null;
    ring.classList.remove("is-dragging");
    setTimeout(() => { moved = false; }, 0);
    wake();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  // ---------- the viewer: every photo in a row, slid sideways so one sits in the middle ----------
  const stage = viewer.querySelector("[data-viewer-stage]"), shade = viewer.querySelector("[data-viewer-shade]"), live = viewer.querySelector("[data-viewer-live]");
  const chrome = [...viewer.querySelectorAll(".viewer__btn")];
  const EASE = "cubic-bezier(0.2, 0.7, 0.1, 1)", FLY = 560;
  const slides = items.map((d) => {
    const el = document.createElement("figure"), box = document.createElement("div"), caption = document.createElement("figcaption");
    el.className = "viewer__slide";
    box.className = "viewer__media";
    box.style.backgroundImage = `url("${d.thumb}")`; // the thumbnail shows until the full version arrives
    box.style.backgroundPosition = d.pos;
    caption.className = "viewer__cap";
    caption.textContent = d.cap;
    el.append(box, caption);
    stage.append(el);
    return { el, box, caption, media: null, f: null };
  });
  const fill = (s, d) => { // the full photo or video, made the first time it's needed
    if (s.media) return;
    const el = document.createElement(d.kind === "video" ? "video" : "img");
    const ready = () => el.classList.add("is-in");
    if (d.kind === "video") {
      Object.assign(el, { muted: true, loop: true, playsInline: true, preload: "auto", poster: d.posterFull, controls: calm.matches });
      el.setAttribute("aria-label", d.alt);
      el.addEventListener("loadeddata", ready, { once: true });
      el.src = d.full;
    } else {
      el.alt = d.alt;
      el.decoding = "async";
      el.addEventListener("load", ready, { once: true });
      el.src = d.full;
      if (el.complete) ready();
    }
    el.style.objectPosition = d.pos;
    s.box.append(el);
    s.media = el;
  };
  let vw = innerWidth;
  const layout = () => { // where each photo sits when it's in the middle: as large as fits, whole, never past its own size
    vw = viewer.clientWidth || innerWidth;
    const vh = viewer.clientHeight || innerHeight, phone = vw < 600, side = phone ? 16 : Math.max(76, vw * 0.08), top = phone ? 64 : 72, bottom = phone ? 132 : 84;
    const aw = vw - 2 * side, ah = vh - top - bottom;
    slides.forEach((s, i) => {
      const d = items[i], k = Math.min(aw / d.w, ah / d.h, 1), w = Math.round(d.w * k), h = Math.round(d.h * k);
      s.f = { x: Math.round((vw - w) / 2), y: Math.round(top + (ah - h) / 2), w, h };
      Object.assign(s.el.style, { left: `${s.f.x}px`, top: `${s.f.y}px`, width: `${w}px` });
      Object.assign(s.box.style, { width: `${w}px`, height: `${h}px` });
    });
  };
  let at = 0, pos = 0, aim = 0, slide = 0, flying = false;
  const near = (i, p) => { let r = i - p; r -= n * Math.round(r / n); return r; };
  const paint = () => {
    slides.forEach((s, i) => {
      const r = near(i, pos), on = Math.abs(r) < 1.3;
      s.el.style.visibility = on ? "" : "hidden";
      if (on) { fill(s, items[i]); s.el.style.transform = `translate3d(${(r * vw).toFixed(1)}px, 0, 0)`; }
      const v = s.media?.tagName === "VIDEO" ? s.media : null;
      if (v) { const play = viewer.open && !calm.matches && Math.abs(r) < 0.5; if (play && v.paused) v.play().catch(() => {}); else if (!play && !v.paused) v.pause(); }
    });
  };
  const settle = () => { pos = aim = ((Math.round(aim) % n) + n) % n; at = pos; live.textContent = items[at].cap; paint(); };
  const glide = (to) => { // slide the row so photo `to` is in the middle
    cancelAnimationFrame(slide);
    aim = to;
    if (calm.matches) { pos = to; settle(); return; }
    const from = pos, t0 = performance.now(), dur = 520;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      pos = from + (to - from) * (1 - (1 - k) ** 3);
      paint();
      if (k < 1) slide = requestAnimationFrame(step); else settle();
    };
    slide = requestAnimationFrame(step);
  };
  const go = (d) => { if (!flying) glide(Math.round(aim) + d); };
  const fade = (els, a, b, opts) => els.forEach((el) => el.animate([{ opacity: a }, { opacity: b }], opts));

  function show(i, li) {
    at = pos = aim = i;
    open = true;
    document.documentElement.classList.add("is-viewing");
    viewer.showModal();
    layout();
    paint();
    live.textContent = items[i].cap;
    if (calm.matches) return;
    // the photo grows out of its card: same place and size, the thumbnail's crop opening out into the whole frame
    const s = slides[i], f = s.f, a = li.querySelector("button").getBoundingClientRect();
    flying = true;
    li.style.visibility = "hidden";
    fade([shade], 0, 1, { duration: FLY, easing: "ease" });
    fade([s.caption, ...chrome], 0, 1, { duration: 260, delay: FLY - 120, easing: "ease", fill: "backwards" });
    const landed = () => { flying = false; li.style.visibility = ""; };
    s.box.animate([
      { transform: `translate(${a.left - f.x}px, ${a.top - f.y}px)`, width: `${a.width}px`, height: `${a.height}px` },
      { transform: "translate(0, 0)", width: `${f.w}px`, height: `${f.h}px` },
    ], { duration: FLY, easing: EASE }).finished.then(landed, landed);
  }

  function hide() {
    if (flying || !viewer.open) return;
    cancelAnimationFrame(slide);
    pos = aim = at;
    paint();
    // behind the shade, the ring turns this photo to the front; then the photo flies back into that card
    theta = toFront(at);
    glow.fill(0);
    place();
    const li = slots[front], s = slides[at], f = s.f;
    light(front);
    glow[front] = 1;
    place();
    const a = li.querySelector("button").getBoundingClientRect();
    const done = () => {
      viewer.getAnimations({ subtree: true }).forEach((x) => x.cancel());
      li.style.visibility = "";
      viewer.close();
      flying = false;
      open = false;
      document.documentElement.classList.remove("is-viewing");
      paint(); // pauses the viewer's video
      (li.getAttribute("aria-hidden") ? cards[at] : li.querySelector("button")).focus({ preventScroll: true });
      setTimeout(() => { if (lit === front && hovered !== front) light(-1); }, 650); // it lights up as it lands, then dims back into the ring
      wake();
    };
    if (calm.matches) { done(); return; }
    flying = true;
    li.style.visibility = "hidden";
    fade([s.caption, ...chrome], 1, 0, { duration: 160, easing: "ease", fill: "forwards" });
    fade([shade], 1, 0, { duration: FLY - 60, delay: 60, easing: "ease", fill: "forwards" });
    s.box.animate([
      { transform: "translate(0, 0)", width: `${f.w}px`, height: `${f.h}px` },
      { transform: `translate(${a.left - f.x}px, ${a.top - f.y}px)`, width: `${a.width}px`, height: `${a.height}px` },
    ], { duration: FLY - 40, easing: EASE, fill: "forwards" }).finished.then(done, done);
  }

  viewer.querySelector("[data-viewer-prev]").addEventListener("click", () => go(-1));
  viewer.querySelector("[data-viewer-next]").addEventListener("click", () => go(1));
  viewer.querySelector("[data-viewer-close]").addEventListener("click", hide);
  viewer.addEventListener("cancel", (e) => { e.preventDefault(); hide(); }); // Esc flies it back too
  viewer.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
  let cool = 0;
  viewer.addEventListener("wheel", (e) => { // a scroll or a trackpad swipe moves one photo along
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 6 || performance.now() < cool) return;
    cool = performance.now() + 560;
    go(d > 0 ? 1 : -1);
  }, { passive: false });
  // drag or swipe the row; a tap outside the photo closes
  let pull = null;
  stage.addEventListener("pointerdown", (e) => { if (flying || e.button) return; cancelAnimationFrame(slide); pull = { x: e.clientX, from: pos, t: performance.now(), moved: false }; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", (e) => {
    if (!pull) return;
    const dx = e.clientX - pull.x;
    if (!pull.moved && Math.abs(dx) < 8) return;
    pull.moved = true;
    pos = pull.from - dx / vw;
    paint();
  });
  stage.addEventListener("pointerup", (e) => {
    if (!pull) return;
    const dx = e.clientX - pull.x, fast = Math.abs(dx) / Math.max(1, performance.now() - pull.t) > 0.5, p = pull;
    pull = null;
    if (p.moved) glide(Math.abs(dx) > vw * 0.18 || fast ? Math.round(p.from) - Math.sign(dx) : Math.round(p.from));
    else if (!document.elementFromPoint(e.clientX, e.clientY)?.closest(".viewer__media")) hide();
    else glide(Math.round(p.from));
  });
  stage.addEventListener("pointercancel", () => { if (pull) { glide(Math.round(pull.from)); pull = null; } });
})();
