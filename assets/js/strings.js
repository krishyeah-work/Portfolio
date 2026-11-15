// strings.js — the lines between the rows of the work lists (.rows) are strings.
// Cross one with the pointer and it catches, stretches a little, lets go and rings until it settles.
// - Mouse or trackpad only, and never with reduced motion: otherwise the plain CSS lines stay as they are.
// - Each line becomes a 1px-tall SVG drawn in the same place as the CSS line it replaces (home.css hides those
//   once a list has the class "has-strings").
// - Nothing runs while the strings are still: the frame loop starts on a pluck and stops when every string has settled.
// To tune the feel: PULL (how far a string stretches before it lets go, in px), RING (how long it rings, in ms),
// PITCH (how fast it wobbles, in swings per second).

(() => {
  const lists = [...document.querySelectorAll(".rows")];
  if (!lists.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const PULL = 13, RING = 420, PITCH = 9.5;
  const NS = "http://www.w3.org/2000/svg";
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const strings = [];

  // in each list: one string under each row, and one along the top of the list. The top one sits just before the
  // list rather than in its first row, so it stays when rows are filtered out (the Work page's tabs).
  const make = (el, top) => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", top ? "string string--top" : "string");
    svg.setAttribute("aria-hidden", "true");
    const path = svg.appendChild(document.createElementNS(NS, "path"));
    if (top) el.before(svg); else el.append(svg);
    strings.push({ svg, path, y: 0.5, w: 0, at: 0.5, d: 0, held: false, amp: 0, t0: 0 });
  };
  for (const list of lists) {
    const rows = [...list.children];
    if (!rows.length) continue;
    make(list, true);
    rows.forEach((li) => make(li, false));
    list.classList.add("has-strings");
  }
  const area = lists[0].closest("section") || lists[0];

  // a string is one curve from end to end; its middle point is pulled to where the pointer caught it
  const draw = (s) => s.path.setAttribute("d", `M0 ${s.y}Q${(s.at * s.w).toFixed(1)} ${(s.y + 2 * s.d).toFixed(2)} ${s.w.toFixed(1)} ${s.y}`);
  const measure = () => { for (const s of strings) { s.w = s.svg.getBoundingClientRect().width; draw(s); } };
  addEventListener("worklist:change", measure); // the Work page's tabs showed other rows
  new ResizeObserver(measure).observe(area);
  measure();

  // ringing: a swing that dies away
  let raf = 0;
  const tick = (now) => {
    let live = false;
    for (const s of strings) {
      if (s.held || !s.amp) continue;
      const t = now - s.t0, left = Math.abs(s.amp) * Math.exp(-t / RING);
      if (left < 0.2) { s.amp = 0; s.d = 0; s.svg.classList.remove("is-live"); }
      else { s.d = s.amp * Math.exp(-t / RING) * Math.cos((2 * Math.PI * PITCH * t) / 1000); live = true; }
      draw(s);
    }
    raf = live ? requestAnimationFrame(tick) : 0;
  };
  const release = (s) => {
    s.held = false;
    s.amp = clamp(s.d, -PULL, PULL);
    s.t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const releaseAll = () => { for (const s of strings) if (s.held) release(s); };

  let lastY = null;
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const box = area.getBoundingClientRect();
    if (e.clientY < box.top || e.clientY > box.bottom || e.clientX < box.left || e.clientX > box.right) {
      releaseAll(); lastY = null; return; // outside the work section: nothing to measure
    }
    for (const s of strings) {
      const r = s.svg.getBoundingClientRect(); // a 1px-tall box lying on the line
      const dy = e.clientY - r.top;
      const inside = e.clientX >= r.left && e.clientX <= r.right;
      if (s.held) {
        s.d = clamp(dy, -PULL, PULL);
        if (!inside || Math.abs(dy) > PULL) release(s); // stretched as far as it goes: it slips off and rings
        else { s.at = clamp((e.clientX - r.left) / r.width, 0.06, 0.94); draw(s); }
      } else if (inside && lastY !== null && (lastY - r.top < 0) !== (dy < 0)) {
        // the pointer has just crossed this line: it catches
        s.held = true; s.amp = 0;
        s.at = clamp((e.clientX - r.left) / r.width, 0.06, 0.94);
        s.d = clamp(dy, -PULL, PULL);
        s.svg.classList.add("is-live");
        if (Math.abs(dy) > PULL) release(s); else draw(s); // a fast pass strums it straight away
      }
    }
    lastY = e.clientY;
  }, { passive: true });
  document.addEventListener("mouseleave", () => { releaseAll(); lastY = null; });
  addEventListener("blur", () => { releaseAll(); lastY = null; });
})();
