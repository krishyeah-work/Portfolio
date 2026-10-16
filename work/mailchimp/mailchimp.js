// mailchimp.js — interactions used only by the MailChimp case study.
// 1. Early explorations: tabs that switch between option 1 and option 2.
// 2. Cart explorations: a pinned stage where each cart lands, in turn, in the cart slot of the dashboard,
//    with a minimal stepper, and a final cart whose status header cycles through other information types.
// (The logo cover lives in cover.js, shared with the homepage card.)

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Tabs ---------- */
document.querySelectorAll("[data-tabs]").forEach((root) => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const select = (i, focus) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    const panel = panels[i];
    panel.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    if (!reduceMotion) { panel.classList.remove("is-entering"); void panel.offsetWidth; panel.classList.add("is-entering"); }
    window.dispatchEvent(new Event("resize")); // the carousel in the panel re-measures
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      select((to + tabs.length) % tabs.length, true);
    });
  });
  root.classList.add("is-ready");
  select(0);
});

/* ---------- Process strip: the steps reveal left to right once, when the strip comes into view ---------- */
document.querySelectorAll("[data-process]").forEach((el) => {
  if (reduceMotion || !("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    el.classList.add("is-in");
    io.disconnect();
  }, { rootMargin: "0px 0px -15% 0px" });
  io.observe(el);
});

/* ---------- Guidance tooltip on the final cart's "!" icon (hover, focus, or tap) ---------- */
document.querySelectorAll(".seq__tip-btn").forEach((btn) => {
  const box = btn.closest(".seq__cartbox");
  const open = (on) => { box.classList.toggle("is-tip-open", on); btn.setAttribute("aria-expanded", String(on)); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); open(!box.classList.contains("is-tip-open")); });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) open(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
});

/* ---------- Cart explorations sequence ---------- */
(() => {
  const root = document.querySelector("[data-sequence]");
  if (!root || reduceMotion) return;
  const stage = root.querySelector(".seq__stage");
  const items = [...root.querySelectorAll(".seq__item")];
  const texts = items.map((li) => li.querySelector(".seq__text"));
  const steps = root.querySelector(".seq__steps");
  const stepLines = steps ? [...steps.children] : [];
  const final = items[items.length - 1];
  const status = final.querySelector(".seq__status");
  const statusImgs = status ? [...status.children] : [];
  const n = items.length;
  // each cart gets one step of scroll; the final cart gets more (data-weight) for its status animation
  const weights = items.map((li) => Number(li.dataset.weight) || 1);
  const starts = weights.map((w, i) => weights.slice(0, i).reduce((a, b) => a + b, 0));
  const total = weights.reduce((a, b) => a + b, 0);
  root.style.setProperty("--n", total);
  root.classList.add("is-live");

  // Dashboard geometry, in px of the 1600-wide frame: the cart slot starts at (1052, 189) and is 468 wide.
  // In the final cart (702 px wide at 1.5x) the status header starts 36 px from the left.
  const SLOT_X = 1052, SLOT_Y = 189, SLOT_W = 468, STATUS_X = 36 / 702;
  const cartH = items.map((li) => {
    const img = li.querySelector(".seq__cart");
    return (img.getAttribute("height") / img.getAttribute("width")) * SLOT_W;
  });
  const maxH = Math.max(...cartH);
  const wide = matchMedia("(min-width: 860px)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const set = (k, v) => root.style.setProperty(k, typeof v === "number" ? `${Math.round(v * 100) / 100}px` : v);
  const STEP_GAP = 26; // stepper sits this far above the text

  let pin = 77, H = 0;
  const layout = () => {
    const header = document.querySelector(".site-header");
    pin = Math.round((header ? header.getBoundingClientRect().height : 64) + 12);
    set("--pin", pin);
    H = stage.clientHeight;
    const W = stage.clientWidth;
    const sr = stage.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const toc = document.querySelector(".toc");
    const tocRight = toc && toc.offsetParent ? toc.getBoundingClientRect().right : 0;
    // the backdrop may reach past the column: up to the table of contents on the left, the viewport edge on the right
    const al = Math.max(0, sr.left - (tocRight ? tocRight + 16 : 0));
    const ar = Math.max(0, vw - sr.right);
    let s, cx, cy, tw, ty, f1, f2, v0, v1, lw = 0;

    if (wide.matches) {
      const padT = 8, padB = 16;
      tw = clamp(W * 0.4, 240, 360);
      set("--tw", tw);
      const textH = Math.max(...texts.map((t) => t.offsetHeight));
      // keep 170px between the text and the cart, so the leader always has room
      s = Math.min((H - padT - padB) / maxH, (W - tw - 170) / SLOT_W, 1);
      cx = W - SLOT_W * s;
      cy = padT + Math.max(0, (H - padT - padB - maxH * s) / 2);
      // texts share one top edge (the tallest is centred on the carts), with the stepper just above
      ty = cy + Math.max(STEP_GAP, (Math.min(maxH * s, H - padT - padB) - textH) / 2);
      f1 = al + tw * 0.4;
      f2 = al + tw + 24;
      v0 = "0px"; v1 = "9%";
      lw = cx + STATUS_X * SLOT_W * s - (tw + 24);
    } else {
      tw = W;
      set("--tw", tw);
      const textH = Math.max(...texts.map((t) => t.offsetHeight));
      const padB = 16;
      ty = STEP_GAP;
      cy = ty + textH + 18;
      s = Math.min((H - cy - padB) / maxH, (W * 0.84) / SLOT_W, 1);
      cx = (W - SLOT_W * s) / 2;
      f1 = al + cx * 0.6;
      f2 = al + cx;
      v0 = `${Math.round(cy - 4)}px`; v1 = `${Math.round(cy + 60 * s)}px`; // keep the dashboard clear of the text above
    }
    set("--s", String(Math.round(s * 10000) / 10000));
    set("--cx", cx); set("--cy", cy);
    set("--bx", cx - SLOT_X * s); set("--by", cy - SLOT_Y * s);
    set("--tw", tw); set("--ty", ty); set("--sy", ty - STEP_GAP);
    set("--al", al); set("--ar", ar);
    set("--f1", f1); set("--f2", f2);
    set("--v0", v0); set("--v1", v1);
    set("--lw", lw);
    root.classList.toggle("no-leader", lw < 140);
    // the empty stage space under the final cart is pulled back, so the next section follows closely
    set("--tail", Math.max(0, H - (cy + cartH[n - 1] * s) - 32));
  };

  let current = -1, statusOn = -2, leaderOn = null;
  const setActive = (i) => {
    if (i === current) return;
    current = i;
    items.forEach((el, k) => {
      el.classList.toggle("is-active", k === i);
      el.classList.toggle("is-past", k < i);
    });
    stepLines.forEach((line, k) => line.classList.toggle("is-on", k === i));
    steps?.classList.toggle("is-off", i >= stepLines.length);
  };
  // k = -1 shows the cart's own "Upon Application Approval" header; 0..6 show the other information types
  const setStatus = (k) => {
    if (k === statusOn) return;
    statusOn = k;
    status?.classList.toggle("is-cycling", k >= 0);
    if (k >= 0) final.querySelector(".seq__cartbox")?.classList.remove("is-tip-open");
    statusImgs.forEach((img, j) => img.classList.toggle("is-on", j === k));
  };
  const setLeader = (on) => {
    if (on === leaderOn) return;
    leaderOn = on;
    final.classList.toggle("is-leader", on);
  };

  let raf = 0;
  const update = () => {
    const r = root.getBoundingClientRect();
    const travel = r.height - H;
    const scrolled = pin - r.top; // < 0 before the stage pins, > travel once it scrolls away
    const u = clamp(scrolled / (travel || 1), 0, 0.9999) * total;
    let i = 0;
    while (i < n - 1 && u >= starts[i + 1]) i++;
    setActive(i);
    // within the final cart: show the leader, cycle the information types, then settle on the one used
    const q = (u - starts[i]) / weights[i];
    const cycling = i === n - 1 && q >= 0.12 && q < 0.88;
    setLeader(cycling);
    setStatus(cycling ? Math.min(statusImgs.length - 1, Math.floor(((q - 0.12) / 0.76) * statusImgs.length)) : -1);
    // the dashboard fades in as the stage arrives, and fades out slowly over the end of the final cart and the exit
    const fadeIn = clamp(1 + scrolled / (H * 0.8), 0, 1);
    const outStart = travel - (travel / total) * 0.35;
    const fadeOut = 1 - clamp((scrolled - outStart) / (travel + H * 0.6 - outStart), 0, 1);
    root.style.setProperty("--bo", (Math.min(0.2 + 0.8 * fadeIn, fadeOut)).toFixed(3));
    // while the carts are pinned, the floating "Scroll to top" button steps aside so it never covers a cart
    document.documentElement.classList.toggle("seq-pinned", scrolled > -40 && scrolled < travel + 40);
  };
  const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
  const relayout = () => { layout(); update(); };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", relayout);
  document.fonts?.ready.then(relayout);
  relayout();
})();
