// quickbooks.js — interactions used only by the QuickBooks rate tables case study.
// 1. In-view triggers for the fee anatomy, money flow and parameter map.
// 2. The column grammar: Tier, then Qual, push the table past the 752px modal; a shared column brings it back.
// 3. The live rate table: a recreated accountant dashboard with the final 752px pop-up on top, drawn at real size
//    and scaled to the stage. Icons, jump links and collapsible sections (open by default), for QuickBooks Payments
//    and Bill Pay, on desktop or as a mobile bottom sheet. All fees are the illustrative values from the Figma finals.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. play each animation once its block comes into view ---------- */
(() => {
  const blocks = document.querySelectorAll("[data-anatomy], [data-money], [data-map]");
  if (reduceMotion || !("IntersectionObserver" in window)) { blocks.forEach((b) => b.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const el = e.target;
      // the money flow loops, so it pauses while off screen; the rest play once
      if (el.matches("[data-money]")) {
        if (e.isIntersecting) el.classList.add("is-in");
        el.querySelectorAll(".money__wire i").forEach((n) => { n.style.animationPlayState = e.isIntersecting ? "running" : "paused"; });
        return;
      }
      if (!e.isIntersecting) return;
      el.classList.add("is-in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  blocks.forEach((b) => io.observe(b));
})();

/* ---------- 752: digits scramble once when the constraint card arrives, then settle left to right ---------- */
(() => {
  const el = document.querySelector("[data-scramble-num]");
  if (!el || reduceMotion || !("IntersectionObserver" in window)) return;
  const final = el.textContent;
  const run = () => {
    const start = performance.now(), dur = 1100;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = [...final].map((d, i) => (p >= 0.35 + (i / final.length) * 0.65 ? d : Math.floor(Math.random() * 10))).join("");
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    };
    requestAnimationFrame(frame);
    setTimeout(() => { el.textContent = final; }, dur + 200);
  };
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect(); run();
  }, { rootMargin: "0px 0px -15% 0px" });
  io.observe(el);
})();

/* ---------- 2. column grammar inside the 752px modal ---------- */
(() => {
  const root = document.querySelector("[data-grammar]");
  if (!root) return;
  const chip = (k) => root.querySelector(`[data-g="${k}"]`);
  const caption = root.querySelector(".grammar__caption");
  // which optional columns show at each step, and what the step says
  const STEPS = [
    { on: ["net", "txn"], text: "Payment method first, fee last." },
    { on: ["net", "txn", "tier"], text: "Tier slots in before the fee." },
    { on: ["net", "txn", "tier", "qual"], text: "Qual pushes the table past the 752px modal.", over: true },
    { on: ["merged", "tier", "qual"], text: "Network and transaction type share a column, and it fits again." },
  ];
  const ALL = ["net", "txn", "merged", "tier", "qual"];
  const show = (i) => {
    const st = STEPS[i];
    ALL.forEach((k) => chip(k).classList.toggle("is-off", !st.on.includes(k)));
    root.classList.toggle("is-over", !!st.over);
    root.dataset.step = String(i + 1);
    caption.classList.add("is-swap");
    setTimeout(() => { caption.textContent = st.text; caption.classList.remove("is-swap"); }, reduceMotion ? 0 : 200);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) { show(STEPS.length - 1); return; }
  show(0);
  // slow enough to read each caption; hovering pauses the steps, leaving resumes them
  let i = 0, timer = 0, inView = false, hovered = false;
  const wait = () => (i === STEPS.length - 1 ? 6000 : 4200);
  const tick = () => { i = (i + 1) % STEPS.length; show(i); schedule(); };
  const schedule = () => { clearTimeout(timer); if (inView && !hovered) timer = setTimeout(tick, wait()); };
  root.addEventListener("mouseenter", () => { hovered = true; clearTimeout(timer); root.classList.add("is-paused"); });
  root.addEventListener("mouseleave", () => { hovered = false; root.classList.remove("is-paused"); schedule(); });
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      inView = e.isIntersecting;
      if (inView) schedule();
      else { clearTimeout(timer); i = 0; show(0); }
    });
  }, { threshold: 0.4 }).observe(root);
})();

/* ---------- 3. live rate table ---------- */
(() => {
  const root = document.querySelector("[data-rt-demo]");
  if (!root) return;
  const stage = root.querySelector("[data-stage]");

  const ICON = {
    card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h2M11 15h3"/>',
    bizcard: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M14 15h4"/><circle cx="8" cy="15" r="1.2"/>',
    bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M5 10v11M19 10v11M9 14v3M12 14v3M15 14v3"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16M10 16h4"/>',
    bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
    refund: '<path d="M9 14 5 10l4-4"/><path d="M5 10h10a4 4 0 0 1 0 8h-1"/>',
    other: '<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  const CHEV = '<svg class="rt-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // fee: { v, pre?, was?, cap?, offer? }; caps sit under the fee, as in the final design
  const F = (v, extra) => Object.assign({ v }, extra);
  const CAP = { cap: "(Min $10 and Max $100)" };
  const OFFER = { offer: "25% off for 3 months" };

  const DATA = {
    payments: {
      title: "Fees for QuickBooks Online Payments",
      sections: [
        // keys: how many leading columns repeat within a group (shown once, then left blank)
        { id: "card", icon: "card", title: "Card payments transaction fees", jump: "Card payments", keys: 2, wide: true,
          cols: ["Payment method", "Network type, Transaction type", "Transaction range", "Fee"],
          rows: [
            ["Keyed", ["PayPal, Non-Amex", "Sale, Refund"], "$0 – $150", F("$10 + 0.75%", CAP)],
            ["Keyed", ["PayPal, Non-Amex", "Sale, Refund"], "$150 – $300", F("$10 + 0.75%", CAP)],
            ["Keyed", ["PayPal, Non-Amex", "Sale, Refund"], "Above $500", F("$5 + 0.75%", Object.assign({}, CAP, OFFER))],
            ["E-invoice", ["Amex", "Sale, Refund"], "$0 – $150", F("$10 + 0.75%", CAP)],
            ["E-invoice", ["Amex", "Sale, Refund"], "$150 – $300", F("$10 + 0.75%", CAP)],
            ["E-invoice", ["Amex", "Sale, Refund"], "Above $500", F("$5 + 0.75%", CAP)],
            ["Swiped", ["Non-Amex, PayPal", "Sale, Refund"], "All ranges", F("$10 + 0.75%", CAP)],
          ] },
        { id: "bank", icon: "bank", title: "Bank payments transaction fees", jump: "Bank payments", keys: 1,
          cols: ["Payment method", "Fee"], rows: [["Bank transfers", F("$10 + 0.75%")]] },
        { id: "bnpl", icon: "calendar", title: "Buy now, pay later", jump: "Buy now, pay later", keys: 1,
          cols: ["Plan", "Fee"], rows: [["Plan A", F("$10 + 0.75%")], ["Plan B", F("$15 + 0.25%")]] },
        { id: "deposit", icon: "bolt", title: "Instant deposit fee", jump: "Instant deposit", keys: 1,
          cols: ["Deposit destination", "Fee"], rows: [["QuickBooks Checking", F("$2.50 + 0.75%")], ["External bank account", F("$10 + 0.75%")]] },
        { id: "returns", icon: "refund", title: "Return charges", jump: "Return charges", keys: 1,
          cols: ["Return type", "Fee"],
          rows: [["Rejected ACH payment", F("0.75%", Object.assign({ pre: "$10 + ", was: "1%", cap: "(Min $10 – Max $100)" }, OFFER))], ["Bounced or returned check", F("$8 + 0.75%")], ["Dispute or chargeback", F("$10 + 0.75%")]] },
        { id: "other", icon: "other", title: "Other fees", jump: "Other fees", note: "Not condition based",
          items: [["International card fee, all networks", "$10 per transaction"], ["ACH convenience fee", "$10 + $0.75 per transaction"]] },
      ],
    },
    billpay: {
      plan: ["QuickBooks Bill Pay Basic", "$XX/mo"],
      title: "Fees for QuickBooks Bill Pay",
      sections: [
        { id: "bp-ach", icon: "bank", title: "Paying by ACH", jump: "ACH", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("No fee")], ["Check", F("$1.50")], ["Faster ACH", F("$10")], ["RTP", F("0.75%", Object.assign({ was: "1%", cap: "(Min $10 – Max $100)" }, OFFER))], ["SUVC", F("No fee")]] },
        { id: "bp-card", icon: "card", title: "Paying by credit card", jump: "Credit card", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("2.9%")], ["Check", F("$1.50")], ["RTP", F("0.75%", Object.assign({ was: "1%", cap: "(Min $10 – Max $100)" }, OFFER))]] },
        { id: "bp-biz", icon: "bizcard", title: "Paying by Intuit Business Credit Card", jump: "Intuit Business Credit Card", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("2.9%")], ["Check", F("2.9%")], ["RTP", F("0.75%", Object.assign({ pre: "2.7% + ", was: "1%", cap: "(Min $10 – Max $100)" }, OFFER))]] },
      ],
    },
  };

  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const feeHtml = (f) =>
    `<span class="fee">${f.pre ? esc(f.pre) : ""}${f.was ? `<s aria-label="was ${esc(f.was)}">${esc(f.was)}</s>` : ""}${esc(f.v)}</span>` +
    (f.cap ? `<span class="fee__cap">${esc(f.cap)}</span>` : "") +
    (f.offer ? `<span class="fee__offer">${esc(f.offer)}</span>` : "");
  const cellHtml = (c) => (Array.isArray(c) ? `${esc(c[0])}<span class="sub">${esc(c[1])}</span>` : typeof c === "object" ? feeHtml(c) : esc(c));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const count = (s) => { const n = s.rows ? s.rows.length : s.items.length; return `${n} ${n === 1 ? "rate" : "rates"}`; };

  let r = 0; // running row index for the staggered entrance
  const anim = () => `class="rt-anim" style="--r: ${r++}"`;

  function table(s, mobile) {
    let h = "";
    if (mobile && s.wide) h += '<p class="rt-swipe" aria-hidden="true">Swipe to see more</p>';
    h += `<div class="rt-scroll"><table class="rt-table${s.wide ? " rt-table--wide" : ""}"><thead><tr>${s.cols.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`;
    s.rows.forEach((row, i) => {
      const prev = s.rows[i - 1];
      const newGroup = i && prev[0] !== row[0];
      h += `<tr ${anim()}${newGroup ? " data-grp" : ""}>`;
      row.forEach((cell, c) => {
        // repeated key cells read once per group (the method, then network and transaction type)
        const blank = prev && c < s.keys && row.slice(0, c + 1).every((v, k) => same(v, prev[k]));
        // on mobile the pinned payment method repeats on every row, so it stays readable while the rest swipes
        const keep = mobile && s.wide && c === 0;
        const cls = [c === 0 ? "k" : "", blank && !keep ? "blank" : ""].filter(Boolean).join(" ");
        h += `<td${cls ? ` class="${cls}"` : ""}>${blank && !keep ? "" : cellHtml(cell)}</td>`;
      });
      h += "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  function sectionHtml(s, mobile) {
    const inner = s.items
      ? `<div class="rt-other"><p>${s.note}</p>${s.items.map(([k, v]) => `<div ${anim()}><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`
      : table(s, mobile);
    return `<div class="rt-sec" id="rt-${s.id}">
      <button type="button" class="rt-sec__head" aria-expanded="true" aria-controls="rt-p-${s.id}" ${anim()}>
        <span class="rt-ico">${svg(s.icon)}</span><span class="rt-sec__title">${s.title}</span><span class="rt-sec__count">${count(s)}</span>${CHEV}
      </button>
      <div class="rt-sec__panel" id="rt-p-${s.id}"><div><div class="rt-sec__inner">${inner}</div></div></div>
    </div>`;
  }

  function bodyHtml(d, mobile) {
    r = 0;
    let h = "";
    if (d.plan) h += `<div class="rt__plan" ${anim()}><span>${d.plan[0]}</span><span>${d.plan[1]} <small>+ applicable taxes</small></span></div>`;
    h += `<p class="rt__title" ${anim()}>${d.title}</p>`;
    h += `<nav class="rt__jump" aria-label="Jump to a fee type" ${anim()}><span>Jump to</span>${d.sections.map((s) => `<a href="#rt-${s.id}" data-jump="${s.id}">${s.jump}</a>`).join("")}</nav>`;
    h += d.sections.map((s) => sectionHtml(s, mobile)).join("");
    return h;
  }

  const DASH = `<div class="dash" aria-hidden="true">
      <div class="dash__brand"><span class="dash__mark"><i></i></span>Accountant</div>
      <div class="dash__top"><span>☰</span><span>Accountant tools</span><span class="dash__search"></span><span class="dash__dot"></span><span class="dash__dot"></span></div>
      <div class="dash__side"><span class="dash__new">+ New</span><small>Your practice</small><span>Clients</span><span>Team</span><span>Billing</span><span>Work</span><small>Your books</small><span>Overview</span><span>Banking</span><span>Expenses</span><span>Sales</span><span>Reports</span></div>
      <div class="dash__main"><h1>Subscriptions and billing</h1>
        <div class="dash__tabs"><span>All clients</span><span>Firm subscriptions</span><span>Billing details</span></div>
        <div class="dash__pills"><span>Show only accountant-billed</span><span>Show only client-billed</span></div>
        <table class="dash__table"><thead><tr><th>Client</th><th>Products</th><th>Price</th><th>Billed to</th><th>Action</th></tr></thead><tbody>
          <tr><td>Bloom &amp; Co. Florist<small>ID: 0000 0000 0001</small></td><td>QuickBooks Payments</td><td class="lnk">$XX/mo</td><td>Firm</td><td class="lnk">Client actions</td></tr>
          <tr><td>Petal Street<small>ID: 0000 0000 0002</small></td><td>QuickBooks Bill Pay</td><td class="lnk">$XX/mo</td><td>Client</td><td class="lnk">Client actions</td></tr>
          <tr><td>Green Thumb Supply<small>ID: 0000 0000 0003</small></td><td>QuickBooks Online</td><td>$XX/mo</td><td>Firm</td><td class="lnk">Client actions</td></tr>
          <tr><td>Rosewood Events<small>ID: 0000 0000 0004</small></td><td>QuickBooks Payments</td><td>$XX/mo</td><td>Firm</td><td class="lnk">Client actions</td></tr>
        </tbody></table></div>
    </div>`;

  const popup = (body) => `<div class="rt" role="dialog" aria-label="Rate table, illustrative fees">
      <div class="rt__head"><p>Here’s a breakdown of your charges</p><button type="button" class="rt__x" aria-label="Close (demo only)" tabindex="-1">×</button></div>
      <div class="rt__body" data-body>${body}</div>
      <div class="rt__foot"><button type="button" class="rt__ok" tabindex="-1">OK</button></div>
    </div>`;

  let product = "payments";
  let device = matchMedia("(max-width: 599px)").matches ? "mobile" : "desktop";

  function render() {
    const mobile = device === "mobile";
    const body = bodyHtml(DATA[product], mobile);
    stage.classList.toggle("is-mobile", mobile);
    stage.querySelectorAll(":scope > :not(.rt-fallback)").forEach((n) => n.remove());
    stage.insertAdjacentHTML("beforeend", mobile
      ? `<div class="phone"><div class="phone__page" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="rt-scrim"></div>${popup(body)}</div>`
      : `<div class="canvas">${DASH}<div class="rt-scrim"></div>${popup(body)}</div>`);
    fit();
  }
  function renderBody() {
    const b = stage.querySelector("[data-body]");
    b.innerHTML = bodyHtml(DATA[product], device === "mobile");
    b.scrollTop = 0;
  }
  // the live table breaks out of the text column and spans the viewport
  function bleed() {
    const vw = document.documentElement.clientWidth;
    const gutter = vw < 760 ? 16 : 32;
    const w = Math.min(1360, vw - gutter * 2);
    const col = root.parentElement.getBoundingClientRect();
    root.style.width = `${w}px`;
    root.style.marginLeft = `${Math.round((vw - w) / 2 - col.left)}px`;
  }
  // the desktop screen is drawn at real size (at least 1100px wide, so the 752px modal keeps its proportion) and scaled down to fit
  function fit() {
    const canvas = stage.querySelector(".canvas");
    if (!canvas) { stage.style.height = ""; return; }
    const w = stage.clientWidth;
    const vw = Math.max(1100, Math.min(1440, w));
    const k = w / vw;
    canvas.style.setProperty("--vw", vw);
    canvas.style.setProperty("--k", k.toFixed(4));
    stage.style.height = `${Math.round(860 * k)}px`;
  }
  function swap(fn) {
    if (reduceMotion) { fn(); return; }
    stage.style.setProperty("--d", "0.05s");
    stage.classList.add("is-swapping");
    setTimeout(() => { fn(); stage.classList.remove("is-swapping"); }, 160);
  }

  // controls
  root.querySelectorAll("[data-product]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.product === product) return;
    product = b.dataset.product;
    root.querySelectorAll("[data-product]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    swap(renderBody);
  }));
  root.querySelectorAll("[data-device]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.device === device) return;
    device = b.dataset.device;
    root.querySelectorAll("[data-device]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    swap(render);
  }));
  root.querySelectorAll("[data-device]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.device === device)));

  // collapsing sections and jump links (delegated, so they survive re-renders)
  stage.addEventListener("click", (e) => {
    const head = e.target.closest(".rt-sec__head");
    if (head) {
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      head.closest(".rt-sec").classList.toggle("is-closed", !open);
      return;
    }
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      e.preventDefault();
      const sec = stage.querySelector(`#rt-${jump.dataset.jump}`);
      const body = stage.querySelector("[data-body]");
      const head2 = sec.querySelector(".rt-sec__head");
      if (head2.getAttribute("aria-expanded") === "false") head2.click();
      body.scrollTo({ top: sec.offsetTop - 4, behavior: reduceMotion ? "auto" : "smooth" });
      sec.classList.add("is-flash");
      setTimeout(() => sec.classList.remove("is-flash"), 900);
      head2.focus({ preventScroll: true });
    }
  });

  bleed();
  render();
  stage.classList.add("is-ready");
  window.addEventListener("resize", () => { bleed(); fit(); });
  // the contents list steps aside while the wide table is on screen, so the two never overlap
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => document.documentElement.classList.toggle("toc-hidden", e.isIntersecting));
    }, { threshold: 0.05 }).observe(root);
  }
  if (reduceMotion || !("IntersectionObserver" in window)) { stage.classList.add("is-live"); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    stage.classList.add("is-live");
    io.disconnect();
  }, { rootMargin: "0px 0px -20% 0px" });
  io.observe(stage);
})();
