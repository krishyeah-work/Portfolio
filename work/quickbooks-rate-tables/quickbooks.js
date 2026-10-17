// quickbooks.js — interactions used only by the QuickBooks rate tables case study.
// 1. In-view triggers for the fee anatomy, money flow, parameter map and column grammar.
// 2. The live rate table: a recreated accountant dashboard with the final pop-up on top.
//    Icons, jump links and collapsible sections (open by default), for QuickBooks Payments and Bill Pay,
//    on desktop or as a mobile bottom sheet. All fees are the illustrative values from the Figma finals.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. play each animation once its block comes into view ---------- */
(() => {
  const blocks = document.querySelectorAll("[data-anatomy], [data-money], [data-map], [data-grammar]");
  if (reduceMotion || !("IntersectionObserver" in window)) { blocks.forEach((b) => b.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const el = e.target;
      // looping pieces (money, grammar) pause while off screen; the rest play once
      if (el.matches("[data-money], [data-grammar]")) {
        if (e.isIntersecting) el.classList.add("is-in");
        el.style.setProperty("--play", e.isIntersecting ? "running" : "paused");
        el.querySelectorAll(".money__wire i, .gcol--new").forEach((n) => { n.style.animationPlayState = e.isIntersecting ? "running" : "paused"; });
        return;
      }
      if (!e.isIntersecting) return;
      el.classList.add("is-in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  blocks.forEach((b) => io.observe(b));
})();

/* ---------- 2. live rate table ---------- */
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

  // fee: { v, pre?, was?, cap?, offer? }
  const F = (v, extra) => Object.assign({ v }, extra);
  const CAPPED = { cap: "Min $10 · Max $100", offer: "25% off for 3 months" };

  const DATA = {
    payments: {
      title: "Fees for QuickBooks Online Payments",
      sections: [
        { id: "card", icon: "card", title: "Card payments transaction fees", jump: "Card payments", keys: 3,
          cols: ["Payment method", "Network type", "Transaction type", "Tier", "Fees", "Min cap", "Max cap"],
          rows: [
            ["Keyed", "PayPal", "Sale", "$0 to $150", F("$10 + 0.75%"), "–", "–"],
            ["Keyed", "PayPal", "Sale", "$150 to $300", F("0.75%"), "$10", "$100"],
            ["Keyed", "PayPal", "Sale", "Above $500", F("0.75%", { offer: "25% off for 3 months" }), "$10", "$100"],
            ["Keyed", "Non-Amex", "Refund", "All amounts", F("$10 + 0.75%"), "–", "–"],
            ["E-invoice", "Amex", "Sale", "$0 to $150", F("0.75%"), "$10", "$100"],
            ["E-invoice", "Amex", "Sale", "Above $500", F("0.75%"), "$10", "$100"],
            ["E-invoice", "Amex", "Refund", "All amounts", F("$10 + 0.75%"), "–", "–"],
            ["Swiped", "Non-Amex", "Sale", "All amounts", F("$10 + 0.75%"), "–", "–"],
            ["Swiped", "PayPal", "Sale", "All amounts", F("$10 + 0.75%"), "–", "–"],
          ] },
        { id: "bank", icon: "bank", title: "Bank payments transaction fees", jump: "Bank payments", keys: 1,
          cols: ["Transfer type", "Fees", "Min cap", "Max cap"],
          rows: [["Bank transfer", F("$10 + 0.75%"), "–", "–"]] },
        { id: "bnpl", icon: "calendar", title: "Buy now, pay later", jump: "Buy now, pay later", keys: 1,
          cols: ["Price plan", "Fees", "Min cap", "Max cap"],
          rows: [["Plan A", F("$10 + 0.75%"), "–", "–"], ["Plan B", F("$15 + 0.25%"), "–", "–"]] },
        { id: "deposit", icon: "bolt", title: "Instant deposit fee", jump: "Instant deposit", keys: 1,
          cols: ["Deposit destination", "Fees", "Min cap", "Max cap"],
          rows: [["QuickBooks Checking", F("$2.50 + 0.75%"), "–", "–"], ["External bank account", F("$10 + 0.75%"), "–", "–"]] },
        { id: "returns", icon: "refund", title: "Return charges", jump: "Return charges", keys: 1,
          cols: ["Return type", "Fees", "Min cap", "Max cap"],
          rows: [["Rejected ACH payment", F("0.75%"), "$10", "$100"], ["Bounced or returned check", F("$8 + 0.75%"), "–", "–"], ["Dispute or chargeback", F("$10 + 0.75%"), "–", "–"]] },
        { id: "other", icon: "other", title: "Other fees", jump: "Other fees", note: "Not condition based",
          items: [["International card fee, all networks", "$10 per transaction"], ["ACH convenience fee", "$10 + $0.75 per transaction"]] },
      ],
    },
    billpay: {
      plan: ["QuickBooks Bill Pay Basic", "$XX/mo"],
      title: "Fees for QuickBooks Bill Pay",
      sections: [
        { id: "bp-ach", icon: "bank", title: "Paying by ACH", jump: "ACH", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("No fee")], ["Check", F("$1.50")], ["Faster ACH", F("$10")], ["RTP", F("0.75%", Object.assign({ was: "1%" }, CAPPED))], ["SUVC", F("No fee")]] },
        { id: "bp-card", icon: "card", title: "Paying by credit card", jump: "Credit card", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("2.9%")], ["Check", F("$1.50")], ["RTP", F("0.75%", Object.assign({ was: "1%" }, CAPPED))]] },
        { id: "bp-biz", icon: "bizcard", title: "Paying by Intuit Business Credit Card", jump: "Intuit Business Credit Card", keys: 1, cols: ["Receiving method", "Fee"],
          rows: [["ACH", F("2.9%")], ["Check", F("2.9%")], ["RTP", F("0.75%", Object.assign({ pre: "2.7% + ", was: "1%" }, CAPPED))]] },
      ],
    },
  };

  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const feeHtml = (f) =>
    `<span class="fee">${f.pre ? esc(f.pre) : ""}${f.was ? `<s aria-label="was ${esc(f.was)}">${esc(f.was)}</s>` : ""}${esc(f.v)}</span>` +
    (f.cap ? `<span class="fee__cap">${esc(f.cap)}</span>` : "") +
    (f.offer ? `<span class="fee__offer">${esc(f.offer)}</span>` : "");
  const isFee = (c) => typeof c === "object";
  const count = (s) => { const n = s.rows ? s.rows.length : s.items.length; return `${n} ${n === 1 ? "rate" : "rates"}`; };

  let r = 0; // running row index for the staggered entrance
  const anim = () => `class="rt-anim" style="--r: ${r++}"`;

  function tableDesktop(s) {
    let h = `<div class="rt-scroll"><table class="rt-table"><thead><tr>${s.cols.map((c, i) => `<th scope="col"${i >= s.cols.length - 2 && s.cols.length > 3 ? ' class="num"' : ""}>${c}</th>`).join("")}</tr></thead><tbody>`;
    s.rows.forEach((row, i) => {
      const prev = s.rows[i - 1];
      const newGroup = !prev || prev[0] !== row[0];
      h += `<tr ${anim()}${newGroup && i ? ' data-grp' : ""}>`;
      row.forEach((cell, c) => {
        // repeated key cells are left blank so each group reads once (method, then network and type)
        const same = prev && c < s.keys && row.slice(0, c + 1).every((v, k) => v === prev[k]);
        const cls = [c === 0 ? "k" : "", same ? "blank" : "", c >= row.length - 2 && row.length > 3 ? "num" : ""].filter(Boolean).join(" ");
        h += `<td${cls ? ` class="${cls}"` : ""}>${same ? "" : isFee(cell) ? feeHtml(cell) : esc(cell)}</td>`;
      });
      h += "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  function tableMobile(s) {
    if (s.cols.length > 4) {
      // many attributes: one small card per rate, with only the values that apply
      return s.rows.map((row) => {
        let h = `<div ${anim()}><div class="m-card">`;
        row.forEach((cell, c) => {
          if (isFee(cell)) h += `<div class="m-fee"><span>${s.cols[c]}</span><b>${feeHtml(cell)}</b></div>`;
          else if (cell !== "–") h += `<div><span>${s.cols[c]}</span><b>${esc(cell)}</b></div>`;
        });
        return h + "</div></div>";
      }).join("");
    }
    return s.rows.map((row) => {
      const fee = row.find(isFee);
      const caps = row.length > 3 && row[2] !== "–" ? `<span class="fee__cap">Min ${row[2]} · Max ${row[3]}</span>` : "";
      return `<div class="m-row" ${anim()}><span>${esc(row[0])}</span><span class="r">${feeHtml(fee)}${caps}</span></div>`;
    }).join("");
  }

  function sectionHtml(s, mobile) {
    let inner;
    if (s.items) {
      inner = `<div class="rt-other"><p>${s.note}</p>${s.items.map(([k, v]) => `<div ${anim()}><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`;
    } else inner = mobile ? tableMobile(s) : tableDesktop(s);
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
    stage.querySelectorAll(":scope > :not(.rt-fallback)").forEach((n) => n.remove());
    stage.insertAdjacentHTML("beforeend", mobile
      ? `<div class="phone"><div class="phone__page" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="rt-scrim"></div>${popup(body)}</div>`
      : `${DASH}<div class="rt-scrim"></div>${popup(body)}`);
    fit();
  }
  function renderBody() {
    const b = stage.querySelector("[data-body]");
    b.innerHTML = bodyHtml(DATA[product], device === "mobile");
    b.scrollTop = 0;
  }
  // the live table breaks out of the text column and spans the viewport, so the table reads at full size
  function bleed() {
    const vw = document.documentElement.clientWidth;
    const gutter = vw < 760 ? 16 : 32;
    const w = Math.min(1360, vw - gutter * 2);
    const col = root.parentElement.getBoundingClientRect();
    root.style.width = `${w}px`;
    root.style.marginLeft = `${Math.round((vw - w) / 2 - col.left)}px`;
  }
  function fit() {
    const dash = stage.querySelector(".dash");
    if (dash) dash.style.setProperty("--k", Math.max(stage.clientWidth / 1200, stage.clientHeight / 760).toFixed(4));
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
