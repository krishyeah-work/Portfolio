// net-terms.js — interactions used only by the Net Terms case study.
// 1. In-view triggers for one-off reveals (origin, payment gap, modes, the approved-screen spotlight, overview art).
// 2. Hero: Immediate holds, then Net Terms steps the dot through Net 30, 60 and 90 while the day count follows. Replayable.
// 3. Counters: launch targets count up, the $1.50 fact counts up, the 11 scrambles once.
// 4. Lifecycle: the active step walks from eligible to monitor.
// 5. Applying: a stepper over Krishna's QuickBooks Accountant screens; every screen shares one cell, so the height never changes.
// 6. Status: the QuickBooks Online page and payment widget drawn at true scale (1440 x 900), spanning the viewport.
// 7. Emails: an inbox with a credit meter for the limit alerts.
// Every player pauses on hover or focus, stops off screen, and respects prefers-reduced-motion.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasIO = "IntersectionObserver" in window;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- helpers ---------- */
const onceInView = (el, fn, margin = "0px 0px -12% 0px") => {
  if (!el) return;
  if (reduceMotion || !hasIO) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect(); fn();
  }, { rootMargin: margin });
  io.observe(el);
};

// a looping player: advances while the block is on screen and not hovered or focused
function player(root, { count, wait: ms, show }) {
  let i = 0, timer = 0, inView = false, held = false;
  const delay = typeof ms === "function" ? ms : () => ms;
  const schedule = () => { clearTimeout(timer); if (inView && !held && !reduceMotion) timer = setTimeout(() => go(i + 1), delay(i)); };
  const go = (n) => { i = (n + count) % count; show(i); schedule(); };
  const hold = (on) => { held = on; root.classList.toggle("is-paused", on); if (on) clearTimeout(timer); else schedule(); };
  root.addEventListener("mouseenter", () => hold(true));
  root.addEventListener("mouseleave", () => hold(false));
  root.addEventListener("focusin", () => hold(true));
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) hold(false); });
  if (hasIO) {
    new IntersectionObserver((entries) => entries.forEach((e) => {
      inView = e.isIntersecting;
      root.classList.toggle("is-playing", inView && !reduceMotion);
      if (inView) schedule(); else clearTimeout(timer);
    }), { threshold: 0.35 }).observe(root);
  }
  return { go };
}

// arrow keys, Home and End across a set of tabs
function arrowKeys(tabs, pick) {
  tabs.forEach((t, k) => t.addEventListener("keydown", (e) => {
    const to = { ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1, ArrowUp: k - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const n = (to + tabs.length) % tabs.length;
    pick(n); tabs[n].focus();
  }));
}
const selectTab = (tabs, n) => tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === n)); t.tabIndex = k === n ? 0 : -1; });
// on phones the step and email lists scroll sideways; keep the active one in sight without moving the page
const keepInStrip = (el, strip) => {
  if (!strip || strip.scrollWidth <= strip.clientWidth + 2) return;
  const left = strip.scrollLeft + el.getBoundingClientRect().left - strip.getBoundingClientRect().left - 12;
  strip.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
};
// count a number up with an ease-out
const countUp = (el, to, { dur = 1100, decimals = 0, suffix = "" } = {}) => {
  if (reduceMotion) { el.textContent = to.toFixed(decimals) + suffix; return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- 1. one-off reveals ---------- */
document.querySelectorAll("[data-gap], [data-modes], [data-origin]").forEach((el) => onceInView(el, () => el.classList.add("is-in"), "0px 0px -18% 0px"));
document.querySelectorAll("[data-spot]").forEach((el) => onceInView(el, () => el.classList.add("is-in"), "0px 0px -30% 0px"));
// the overview's invoice terms cycle only while the overview is on screen
(() => {
  const ov = document.querySelector(".ov");
  if (!ov || reduceMotion || !hasIO) return;
  new IntersectionObserver(([e]) => ov.classList.toggle("is-live", e.isIntersecting), { threshold: 0.3 }).observe(ov);
})();

/* ---------- 2. hero: Immediate, then Net 30, Net 60, Net 90 ---------- */
(() => {
  const root = document.querySelector("[data-terms]");
  if (!root) return;
  const days = root.querySelector("[data-days]");
  const marks = [...root.querySelectorAll(".terms__mark")];
  const replay = root.querySelector("[data-replay]");
  let raf = 0, run = 0;

  const count = (to, dur) => {
    cancelAnimationFrame(raf);
    const from = Number(days.textContent) || 0, start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      days.textContent = String(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const stop = (n) => {
    root.dataset.stop = String(n);
    marks.forEach((m, k) => m.classList.toggle("is-on", k === n && n > 0));
  };
  const reset = () => { cancelAnimationFrame(raf); root.dataset.mode = "imm"; stop(0); days.textContent = "0"; };
  const end = () => { root.dataset.mode = "net"; stop(3); days.textContent = "90"; };

  // each run gets an id, so a replay mid-way cancels the old sequence cleanly
  const play = async () => {
    const id = ++run;
    reset();
    await wait(900);                          // Immediate stays highlighted first
    if (id !== run) return;
    root.dataset.mode = "net";
    await wait(500);
    for (const [n, d] of [[1, 30], [2, 60], [3, 90]]) {
      if (id !== run) return;
      stop(n); count(d, 1100);
      await wait(1100 + (n < 3 ? 1100 : 0)); // travel, then hold at each stop
    }
  };

  replay.addEventListener("click", () => { if (reduceMotion) { end(); return; } play(); });
  onceInView(root, () => {
    root.classList.add("is-in");
    if (reduceMotion) { end(); return; }
    setTimeout(play, 400);
  }, "0px");
})();

/* ---------- 3. counters ---------- */
(() => {
  const band = document.querySelector("[data-targets]");
  if (band) {
    const nums = [...band.querySelectorAll("[data-to]")];
    nums.forEach((n) => { if (!reduceMotion && hasIO) n.textContent = `0${n.dataset.suffix || ""}`; });
    onceInView(band, () => nums.forEach((n, k) => setTimeout(() => countUp(n, Number(n.dataset.to), { suffix: n.dataset.suffix || "" }), k * 120)), "0px 0px -15% 0px");
  }
  const fact = document.querySelector("[data-count]");
  if (fact) onceInView(fact, () => countUp(fact, Number(fact.dataset.count), { dur: 1200, decimals: 2 }), "0px 0px -20% 0px");
  const el = document.querySelector("[data-scramble-num]");
  if (!el || reduceMotion || !hasIO) return;
  const final = el.textContent;
  onceInView(el, () => {
    const start = performance.now(), dur = 1000;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = [...final].map((d, k) => (p >= 0.35 + (k / final.length) * 0.65 ? d : Math.floor(Math.random() * 10))).join("");
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    };
    requestAnimationFrame(frame);
    setTimeout(() => { el.textContent = final; }, dur + 200);
  }, "0px 0px -15% 0px");
})();

/* ---------- 4. lifecycle: the active step walks through the seven stages, slowly enough to read ---------- */
(() => {
  const root = document.querySelector("[data-life]");
  if (!root) return;
  const steps = [...root.children];
  const show = (n) => steps.forEach((s, k) => { s.classList.toggle("is-on", k === n); s.classList.toggle("is-done", k < n); });
  if (reduceMotion || !hasIO) { show(steps.length - 1); return; }
  let n = -1, timer = 0;
  const tick = () => {
    n = (n + 1) % (steps.length + 1);
    show(n < steps.length ? n : -1);
    timer = setTimeout(tick, n === steps.length - 1 ? 3200 : n === steps.length ? 900 : 1700);
  };
  new IntersectionObserver((entries) => entries.forEach((e) => {
    clearTimeout(timer);
    if (e.isIntersecting) tick(); else { n = -1; show(-1); }
  }), { threshold: 0.4 }).observe(root);
})();

/* ---------- 5. applying: stepper over the real screens ---------- */
(() => {
  const root = document.querySelector("[data-apply]");
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const show = (n) => {
    selectTab(tabs, n);
    panels.forEach((p, k) => {
      const on = k === n;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-hidden", String(!on));
      p.inert = !on;
    });
    keepInStrip(tabs[n], root.querySelector(".apply__steps"));
    const bar = tabs[n].querySelector(".apply__bar");   // restart the progress bar on the active step
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
  };
  show(0);
  const p = player(root, { count: tabs.length, wait: 5200, show });
  tabs.forEach((t, k) => t.addEventListener("click", () => p.go(k)));
  arrowKeys(tabs, (k) => p.go(k));
})();

/* ---------- 6. status: the QuickBooks Online page and widget at true scale ---------- */
(() => {
  const root = document.querySelector("[data-states]");
  if (!root) return;
  const stage = root.querySelector("[data-stage]");
  const canvas = root.querySelector("[data-canvas]");
  const drawer = root.querySelector("[data-drawer]");
  const caps = [...root.querySelectorAll("[data-cap]")];
  const tabs = [...root.querySelectorAll("[data-state]")];
  const W = 1440, H = 900;   // the Figma frames' layout size; the drawer is 576px wide in it
  const phone = matchMedia("(max-width: 699px)");

  const I = {
    pencil: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2.5l3 3L5 14H2v-3z"/></svg>',
    bank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 6l7-3 7 3M5 10v9M19 10v9M9 13v4M12 13v4M15 13v4M3 21h18"/></svg>',
    invoice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    clock: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 3v3.2l2 1.3"/></svg>',
    warn: '<svg viewBox="0 0 22 20" aria-hidden="true"><path d="M11 1 21 19H1z" fill="#d52b1e"/><path d="M11 7.5v5.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="16" r="1.2" fill="#fff"/></svg>',
  };
  const radio = (label, on, help) => `<span class="nt-radio${on ? " is-on" : ""}"><i></i>${label}${help ? '<span class="q">?</span>' : ""}</span>`;
  const toggle = (net) => `<div class="nt-toggle">${radio("Immediate", !net)}${radio("Net Terms", net, true)}</div>`;
  const heading = '<h4 class="nt-h">How would you like to pay?</h4>';
  const pm = (logo, cls, title, meta, sub, on) => `<div class="nt-pm">${radio("", on)}<span class="nt-pm__logo nt-pm__logo--${cls}">${logo}</span><span class="nt-pm__t"><b>${title}</b>${meta ? ` <span>${meta}</span>` : ""}<small>${sub}</small></span><span class="nt-pm__edit">${I.pencil}</span></div>`;
  const methods = () =>
    pm("VISA", "visa", "Visa *1234", "Expires 3/2028", "Brightwave Solutions Inc.", true) +
    pm("DISCOVER", "disc", "Discover *2345", "Expires 3/2028", "John Doe") +
    pm("Pay", "apay", "Apple Pay", "john.doe@gmail.com", "John Doe") +
    pm(I.bank, "bank", "Bank account *2345", "", "John Doe") +
    '<div class="nt-add"><span>+</span>Add payment method</div>';
  const useBtn = '<span class="nt-btn">Use payment method</span>';

  // copy taken from Krishna's Figma frames for each state
  const STATES = {
    ne: { body: `<h4 class="nt-h">Saved payment method(s)</h4>${methods()}`, foot: useBtn },
    el: { body: `${heading}${toggle(false)}<p class="nt-sub">Saved payment method(s)</p>${methods()}`, foot: useBtn },
    ip: { body: `${heading}${toggle(true)}<div class="nt-status nt-status--wait"><span class="nt-status__ico">${I.clock}</span><div><h5>Your Net Terms application is currently in progress.</h5><ul><li>You will be notified of your application status by email or you could come back to this screen to check the status.</li><li>You can continue using Immediate Terms until the review is complete.</li></ul></div></div>`, foot: "" },
    de: { body: `${heading}${toggle(true)}<div class="nt-status nt-status--stop"><span class="nt-status__ico">${I.warn}</span><div><h5>Your Net Terms application has been declined</h5><p>Continue with Immediate Terms to complete your transaction or keep your account active.</p></div></div>`, foot: "" },
    ap: { body: `${heading}${toggle(true)}<div class="nt-pm nt-pm--inv is-picked">${radio("", true)}<span class="nt-pm__logo nt-pm__logo--inv">${I.invoice}</span><span class="nt-pm__t"><b>Invoice</b> <span>Net 30</span></span></div>`, foot: useBtn },
    oi: { body: `<div class="nt-alert">${I.warn}<div><h5>Payment Method Update Unavailable</h5><p>Your account is currently billed by invoice and has outstanding payments. Please clear all pending invoices to enable payment method updates.</p></div><span class="nt-alert__x">×</span></div>${heading}${toggle(false)}<p class="nt-sub">Saved payment method(s)</p>${methods()}`, foot: useBtn, invoiced: true },
  };
  const keys = tabs.map((t) => t.dataset.state);

  const render = (n, animate) => {
    const key = keys[n], s = STATES[key];
    selectTab(tabs, n);
    drawer.innerHTML = `<span class="nt-drawer__x" aria-hidden="true">×</span><div class="nt-drawer__body">${s.body}</div><div class="nt-drawer__foot">${s.foot}</div>`;
    drawer.setAttribute("aria-label", `Payment widget, ${tabs[n].textContent} state`);
    stage.classList.toggle("is-inv", !!s.invoiced);   // with open invoices the page already reads Invoice Net 30
    caps.forEach((c) => c.classList.toggle("is-on", c.dataset.cap === key));
    if (animate && !reduceMotion) { stage.classList.remove("is-entering"); void stage.offsetWidth; stage.classList.add("is-entering"); }
  };

  // the demo breaks out of the text column and spans the viewport, sized so the whole page fits on screen
  function layout() {
    root.style.width = ""; root.style.marginLeft = "";
    if (phone.matches) { canvas.style.removeProperty("--k"); stage.style.height = ""; return; }
    const vw = document.documentElement.clientWidth;
    const col = root.parentElement.getBoundingClientRect();
    const gutter = vw < 760 ? 16 : 32;
    const fitHeight = Math.max(560, window.innerHeight - 150) * (W / H);
    const w = Math.round(Math.max(col.width, Math.min(1360, vw - gutter * 2, fitHeight)));
    root.style.width = `${w}px`;
    root.style.marginLeft = `${Math.round((vw - w) / 2 - col.left)}px`;
    const k = stage.clientWidth / W;
    canvas.style.setProperty("--k", k.toFixed(4));
    stage.style.height = `${Math.round(H * k)}px`;
  }

  render(0, false);
  layout();
  window.addEventListener("resize", layout);
  phone.addEventListener?.("change", layout);
  const p = player(root, { count: keys.length, wait: (i) => (keys[i] === "ip" || keys[i] === "oi" ? 6200 : 4600), show: (n) => render(n, true) });
  tabs.forEach((t, k) => t.addEventListener("click", () => p.go(k)));
  arrowKeys(tabs, (k) => p.go(k));
  // the contents list steps aside while the wide demo is on screen, so the two never overlap
  if (hasIO) new IntersectionObserver((entries) => entries.forEach((e) => document.documentElement.classList.toggle("toc-hidden", e.isIntersecting)), { threshold: 0.05 }).observe(root);
})();

/* ---------- 7. emails: inbox with a credit meter ---------- */
(() => {
  const root = document.querySelector("[data-mail]");
  if (!root) return;
  const tabs = [...root.querySelectorAll("[data-mail-i]")];
  const img = root.querySelector("[data-mail-img]");
  const box = img.parentElement;
  const meter = root.querySelector(".mail__meter");
  const fill = root.querySelector("[data-meter]");
  const pctText = root.querySelector("[data-pct]");
  const D = "/work/net-terms/img/";
  const MAIL = [
    ["mail-submitted", 676, null, "Application Update email: your Net Terms application has been successfully submitted, with status Submitted and a View application status button."],
    ["mail-approved", 712, null, "Application Approved email: your Net Terms application has been approved, with status Approved, terms Net 30 and a Get started now button."],
    ["mail-declined", 768, null, "Application Declined email: unable to approve it at this time and you may reapply in the future, with status Declined and a View details button."],
    ["mail-invoice", 998, null, "Invoice Generated email: invoice number, date, total, terms Net 45 and due date, View invoice and Pay now buttons, and bank details for wire transfers."],
    ["mail-80", 682, 80, "Credit Limit Alert, 80% Used: usage has reached 80% of the limit, with credit limit, current usage and a View account details button."],
    ["mail-95", 735, 95, "Credit Limit Alert, Nearing Limit: usage has reached 95% of the credit limit, with View invoice and Make a payment buttons."],
    ["mail-100", 735, 100, "Credit Limit Reached, Account Blocked: usage has reached 100% of the credit limit and services may be restricted until payment is made."],
    ["mail-over", 730, 104, "Credit Limit Alert: the account balance has exceeded the assigned limit; make a payment or request a credit limit review."],
  ];
  const show = (n) => {
    const [file, h, pct, alt] = MAIL[n];
    selectTab(tabs, n);
    keepInStrip(tabs[n], root.querySelector(".mail__list"));
    meter.classList.toggle("is-off", pct === null);
    fill.style.setProperty("--fill", `${Math.min(pct || 0, 100)}%`);
    pctText.textContent = pct === null ? "–" : pct > 100 ? "Over" : `${pct}%`;
    const swap = () => {
      img.src = `${D}${file}.webp`; img.height = h; img.alt = alt;
      img.setAttribute("aria-label", `Enlarge image: ${alt}`);
      box.scrollTop = 0; box.classList.remove("is-swap");
    };
    if (reduceMotion) { swap(); return; }
    box.classList.add("is-swap");
    setTimeout(swap, 200);
  };
  // warm the cache so swaps don't flash
  onceInView(root, () => MAIL.forEach(([f]) => { const i = new Image(); i.src = `${D}${f}.webp`; }), "0px 0px 30% 0px");
  const p = player(root, { count: MAIL.length, wait: 4600, show });
  tabs.forEach((t, k) => t.addEventListener("click", () => p.go(k)));
  arrowKeys(tabs, (k) => p.go(k));
})();
