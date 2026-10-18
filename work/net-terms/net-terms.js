// net-terms.js — interactions used only by the Net Terms case study.
// 1. In-view triggers for one-off reveals (hero, payment gap, modes, the approved-screen spotlight).
// 2. Hero: Immediate and Net Terms swap, the dot travels to day 30 and the day count follows.
// 3. Counters: the $1.50 fact counts up; the 11 scrambles once.
// 4. Lifecycle: the active step walks from eligible to monitor.
// 5. Applying: a stepper over Krishna's QuickBooks Accountant screens, auto-advancing while in view.
// 6. Status: the QuickBooks Online payment widget recreated in each state, with the shipped copy.
// 7. Emails: an inbox with a credit meter for the limit alerts.
// Every player pauses on hover or focus, stops off screen, and respects prefers-reduced-motion.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasIO = "IntersectionObserver" in window;

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
function player(root, { count, wait, show }) {
  let i = 0, timer = 0, inView = false, held = false;
  const ms = typeof wait === "function" ? wait : () => wait;
  const schedule = () => { clearTimeout(timer); if (inView && !held && !reduceMotion) timer = setTimeout(() => go(i + 1, true), ms(i)); };
  const go = (n, auto) => { i = (n + count) % count; show(i, auto); schedule(); };
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
  return { go, get index() { return i; } };
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

/* ---------- 1. one-off reveals ---------- */
document.querySelectorAll("[data-gap], [data-modes], [data-spot]").forEach((el) => onceInView(el, () => el.classList.add("is-in"), "0px 0px -18% 0px"));

/* ---------- 2. hero: charged today, or invoiced and due in 30 days ---------- */
(() => {
  const root = document.querySelector("[data-terms]");
  if (!root) return;
  const days = root.querySelector("[data-days]");
  let raf = 0;
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
  const set = (mode) => {
    root.dataset.mode = mode;
    if (reduceMotion) { days.textContent = mode === "net" ? "30" : "0"; return; }
    count(mode === "net" ? 30 : 0, mode === "net" ? 1600 : 700);
  };
  onceInView(root, () => {
    root.classList.add("is-in");
    if (reduceMotion) { set("net"); return; }
    let mode = "imm", timer = 0, inView = true;
    const loop = () => { timer = setTimeout(() => { mode = mode === "imm" ? "net" : "imm"; set(mode); loop(); }, mode === "imm" ? 1800 : 4200); };
    loop();
    if (hasIO) new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !inView) { inView = true; loop(); }
      if (!e.isIntersecting) { inView = false; clearTimeout(timer); }
    })).observe(root);
  }, "0px");
})();

/* ---------- 3. counters ---------- */
(() => {
  const el = document.querySelector("[data-count]");
  if (!el) return;
  const to = Number(el.dataset.count);
  onceInView(el, () => {
    if (reduceMotion) return;
    const start = performance.now(), dur = 1200;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(2);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, "0px 0px -20% 0px");
})();
(() => {
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

/* ---------- 4. lifecycle: the active step walks through the seven stages ---------- */
(() => {
  const root = document.querySelector("[data-life]");
  if (!root) return;
  const steps = [...root.children];
  const show = (n) => steps.forEach((s, k) => { s.classList.toggle("is-on", k === n); s.classList.toggle("is-done", k < n); });
  if (reduceMotion || !hasIO) { show(steps.length - 1); return; }
  let n = -1, timer = 0;
  const tick = () => { n = (n + 1) % (steps.length + 2); show(n < steps.length ? n : -1); timer = setTimeout(tick, n === steps.length - 1 ? 2200 : 1100); };
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
    panels.forEach((p, k) => { p.hidden = k !== n; });
    if (!reduceMotion) { const p = panels[n]; p.classList.remove("is-entering"); void p.offsetWidth; p.classList.add("is-entering"); }
    keepInStrip(tabs[n], root.querySelector(".apply__steps"));
    // restart the progress bar on the active step
    const bar = tabs[n].querySelector(".apply__bar");
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
  };
  const p = player(root, { count: tabs.length, wait: 5200, show });
  tabs.forEach((t, k) => t.addEventListener("click", () => p.go(k)));
  arrowKeys(tabs, (k) => p.go(k));
})();

/* ---------- 6. status: the QuickBooks Online payment widget, recreated ---------- */
(() => {
  const root = document.querySelector("[data-states]");
  if (!root) return;
  const stage = root.querySelector("[data-stage]");
  const drawer = root.querySelector("[data-drawer]");
  const caption = root.querySelector("[data-caption]");
  const tabs = [...root.querySelectorAll("[data-state]")];

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

  const STATES = {
    ne: { body: `<h4 class="nt-h">Saved payment method(s)</h4>${methods()}`, foot: useBtn,
      text: "<b>Not eligible.</b> The option never appears. If eligibility can't be checked, the widget behaves the same way." },
    el: { body: `${heading}${toggle(false)}<p class="nt-sub">Saved payment method(s)</p>${methods()}`, foot: useBtn,
      text: "<b>Eligible.</b> Net Terms sits beside Immediate, which stays selected until the customer chooses otherwise." },
    ip: { body: `${heading}${toggle(true)}<div class="nt-status nt-status--wait"><span class="nt-status__ico">${I.clock}</span><div><h5>Your Net Terms application is currently in progress.</h5><ul><li>You will be notified of your application status by email or you could come back to this screen to check the status.</li><li>You can continue using Immediate Terms until the review is complete.</li></ul></div></div>`, foot: "",
      text: "<b>In review.</b> Payments continue on Immediate Terms. If the status can't load, this message shows instead of an error." },
    de: { body: `${heading}${toggle(true)}<div class="nt-status nt-status--stop"><span class="nt-status__ico">${I.warn}</span><div><h5>Your Net Terms application has been declined</h5><p>Continue with Immediate Terms to complete your transaction or keep your account active.</p></div></div>`, foot: "",
      text: "<b>Declined.</b> The customer carries on with Immediate Terms." },
    ap: { body: `${heading}${toggle(true)}<div class="nt-pm nt-pm--inv is-picked">${radio("", true)}<span class="nt-pm__logo nt-pm__logo--inv">${I.invoice}</span><span class="nt-pm__t"><b>Invoice</b> <span>Net 30</span></span></div>`, foot: useBtn,
      text: "<b>Approved.</b> Invoice Net 30 is the only method under Net Terms. Saving it switches the account." },
    oi: { body: `<div class="nt-alert">${I.warn}<div><h5>Payment Method Update Unavailable</h5><p>Your account is currently billed by invoice and has outstanding payments. Please clear all pending invoices to enable payment method updates.</p></div><span class="nt-alert__x">×</span></div>${heading}${toggle(false)}<p class="nt-sub">Saved payment method(s)</p>${methods()}`, foot: useBtn,
      text: "<b>Open invoices.</b> A switch back to Immediate waits until every Net Terms invoice is paid." },
  };
  const keys = tabs.map((t) => t.dataset.state);

  const render = (n, animate) => {
    const s = STATES[keys[n]];
    selectTab(tabs, n);
    drawer.innerHTML = `<span class="nt-drawer__x" aria-hidden="true">×</span><div class="nt-drawer__body">${s.body}</div><div class="nt-drawer__foot">${s.foot}</div>`;
    drawer.setAttribute("aria-label", `Payment widget, ${tabs[n].textContent} state`);
    if (animate && !reduceMotion) { stage.classList.remove("is-entering"); void stage.offsetWidth; stage.classList.add("is-entering"); }
    caption.classList.add("is-swap");
    setTimeout(() => { caption.innerHTML = s.text; caption.classList.remove("is-swap"); }, reduceMotion ? 0 : 180);
  };
  render(0, false);
  const p = player(root, { count: keys.length, wait: (i) => (keys[i] === "ip" || keys[i] === "oi" ? 6200 : 4600), show: (n) => render(n, true) });
  tabs.forEach((t, k) => t.addEventListener("click", () => p.go(k)));
  arrowKeys(tabs, (k) => p.go(k));
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
