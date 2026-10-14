// mailchimp.js — interactions used only by the MailChimp case study.
// Cart explorations: a pinned stage where each cart lands, in turn, in the cart slot of the dashboard.
// (The logo cover lives in cover.js, shared with the homepage card.)

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Cart explorations sequence ---------- */
(() => {
  const root = document.querySelector("[data-sequence]");
  if (!root || reduceMotion) return;
  const stage = root.querySelector(".seq__stage");
  const items = [...root.querySelectorAll(".seq__item")];
  const dots = [...root.querySelectorAll(".seq__dot")];
  const texts = items.map((li) => li.querySelector(".seq__text"));
  const n = items.length;
  root.style.setProperty("--n", n);
  root.classList.add("is-live");

  // Dashboard geometry, in px of the 1600-wide frame: the cart slot starts at (1052, 189) and is 468 wide.
  const SLOT_X = 1052, SLOT_Y = 189, SLOT_W = 468;
  const cartH = items.map((li) => {
    const img = li.querySelector(".seq__cart");
    return (img.getAttribute("height") / img.getAttribute("width")) * SLOT_W;
  });
  const maxH = Math.max(...cartH);
  const wide = matchMedia("(min-width: 860px)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const set = (k, v) => root.style.setProperty(k, typeof v === "number" ? `${Math.round(v * 100) / 100}px` : v);

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
    let s, cx, cy, tw, ty, f1, f2, v0, v1;

    if (wide.matches) {
      const padT = 8, padB = 30;
      tw = clamp(W * 0.4, 240, 360);
      s = Math.min((H - padT - padB) / maxH, (W - tw - 40) / SLOT_W, 1);
      cx = W - SLOT_W * s;
      cy = padT + Math.max(0, (H - padT - padB - maxH * s) / 2);
      ty = `${Math.round(cy + (Math.min(maxH * s, H - padT - padB)) / 2)}px`;
      f1 = al + tw * 0.4;
      f2 = al + tw + 24;
      v0 = "0px"; v1 = "9%";
    } else {
      tw = W;
      set("--tw", tw);
      const textH = Math.max(...texts.map((t) => t.offsetHeight));
      const padB = 26;
      cy = textH + 18;
      s = Math.min((H - cy - padB) / maxH, (W * 0.84) / SLOT_W, 1);
      cx = (W - SLOT_W * s) / 2;
      ty = "0px";
      f1 = al + cx * 0.6;
      f2 = al + cx;
      v0 = `${Math.round(cy - 4)}px`; v1 = `${Math.round(cy + 60 * s)}px`; // keep the dashboard clear of the text above
    }
    set("--s", String(Math.round(s * 10000) / 10000));
    set("--cx", cx); set("--cy", cy);
    set("--bx", cx - SLOT_X * s); set("--by", cy - SLOT_Y * s);
    set("--tw", tw); set("--ty", ty);
    set("--al", al); set("--ar", ar);
    set("--f1", f1); set("--f2", f2);
    set("--v0", v0); set("--v1", v1);
  };

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
  const update = () => {
    const r = root.getBoundingClientRect();
    const travel = r.height - H;
    const scrolled = pin - r.top; // < 0 before the stage pins, > travel once it scrolls away
    setActive(Math.floor(clamp(scrolled / (travel || 1), 0, 0.999) * n));
    // the dashboard fades in as the stage arrives, and fades out slowly over the end of the last cart and the exit
    const fadeIn = clamp(1 + scrolled / (H * 0.8), 0, 1);
    const outStart = travel - (travel / n) * 0.35;
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
