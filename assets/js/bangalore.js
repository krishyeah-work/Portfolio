// bangalore.js — Bangalore above every footer, drawn like a Van Gogh pen sketch with colour. A swirling sky over
// Vidhana Soudha, a gopuram and tech-park towers; shops, rain trees, gulmohar, pink trumpet trees and coconut palms
// along the Namma Metro viaduct; street lamps, a resting cow and a sleeping dog on the footpath. A metro train, an
// auto and a flower seller's cart move through it.
//
// Everything is to scale, at four depths (pixels per metre): the road 18, the footpath 14, the viaduct row 5 and the
// skyline 2. So a 21 m metro coach is 105px long, a 2.6 m auto 47px, a 1.55 m flower seller 28px, and the 46 m
// Vidhana Soudha 92px tall. The sky follows the time in Bangalore: dawn, day, dusk and night (sun or moon, stars,
// lit windows and lamps). Purely decorative (aria-hidden). Moves only while on screen; holds still for reduced
// motion. Styles: footer-live.css.

(() => {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  const H = 184, MID = 1500, X0 = 200, X1 = 2800; // drawn from x 200 to 2800 and cropped to the window, centred on Vidhana Soudha
  const FAR = 160, MIDG = 164, WALK = 168;         // ground lines: the skyline, the viaduct row, the footpath (the road is the bottom edge)
  const DECK = 114, RAIL = 106;                    // underside of the viaduct deck (10 m up) and the rails on it

  // seeded random, so the city is the same on every visit
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const between = (a, b) => a + rnd() * (b - a);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const r = (n) => Math.round(n * 10) / 10;
  const i = Math.round;

  // ---------- pen and brush ----------
  // a pen line: bowed a little, ends jittered and running past the corners, like a quick reed-pen stroke
  const pen = (x1, y1, x2, y2, j = 0.5) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const o1 = between(-0.3, 1) * j * 1.6, o2 = between(-0.3, 1) * j * 1.6, bow = between(-1, 1) * j * Math.min(1, len / 40);
    const ax = x1 - ux * o1 + between(-j, j) * 0.4, ay = y1 - uy * o1 + between(-j, j) * 0.4;
    const bx = x2 + ux * o2 + between(-j, j) * 0.4 - ax, by = y2 + uy * o2 + between(-j, j) * 0.4 - ay;
    return `M${r(ax)} ${r(ay)}q${r(bx / 2 - uy * bow)} ${r(by / 2 + ux * bow)} ${r(bx)} ${r(by)}`;
  };
  const lines = (pts, j = 0.5) => { let s = ""; for (let k = 0; k < pts.length - 1; k++) s += pen(...pts[k], ...pts[k + 1], j); return s; };
  const rule = (x1, x2, y, j = 0.4, step = 160) => { let s = ""; for (let x = x1; x < x2; x += step) s += pen(x, y, Math.min(x + step, x2), y, j); return s; };
  const box = (x, y, w, h) => `M${r(x)} ${r(y)}h${r(w)}v${r(h)}h${r(-w)}z`;
  const outline = (x, y, w, h, j) => lines([[x, y + h], [x, y], [x + w, y], [x + w, y + h]], j);
  // a short curved brush mark from (x, y), heading a, length l
  const dab = (x, y, a, l) => {
    const c = Math.cos(a), s = Math.sin(a), b = between(-0.3, 0.3) * l;
    return `M${i(x)} ${i(y)}q${r((c * l) / 2 - s * b)} ${r((s * l) / 2 + c * b)} ${r(c * l)} ${r(s * l)}`;
  };
  // a spiral of growing half circles, for curls in clouds
  const curl = (x, y, n, a, cw = 1) => {
    let s = `M${r(x)} ${r(y)}`;
    for (let k = 1; k <= n; k++) s += `a${r(k * a)} ${r(k * a)} 0 0 ${cw} ${r((k % 2 ? 2 : -2) * k * a * (cw ? 1 : -1))} 0`;
    return s;
  };
  // path data written short: ".5" for "0.5", no space before a minus
  const tidy = (d) => d.replace(/(^|[^\d.])0\./g, "$1.").replace(/ -/g, "-");
  // a drawing collects path data per style class and paints the classes in the order given
  const drawing = (order) => {
    const d = Object.fromEntries(order.map((c) => [c, ""]));
    const add = (c, s) => { d[c] += s; };
    add.svg = () => order.filter((c) => d[c]).map((c) => `<path class="b-${c}" d="${tidy(d[c])}"/>`).join("");
    return add;
  };

  // ---------- sky: short strokes follow a flow that eddies round a few whirls, as in The Starry Night ----------
  const sky = drawing(["s1", "s2", "s3", "s4"]);
  const whirls = [[430, 48, 44], [900, 40, 52], [1255, 22, 30], [2050, 38, 46], [2480, 32, 42], [2730, 56, 34]];
  const flow = (x, y) => {
    let vx = 1, vy = 0.32 * Math.sin(x / 160 + y / 40);
    for (const [cx, cy, R] of whirls) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, f = 3 * Math.exp(-((d / R) ** 2));
      vx -= (dy / d) * f; vy += (dx / d) * f;
    }
    const n = Math.hypot(vx, vy);
    return [vx / n, vy / n];
  };
  // cooler colours up high, warmer near the horizon
  const tone = (y) => { const u = rnd() + (y / 110 - 0.5) * 0.7; return u < 0.38 ? "s1" : u < 0.68 ? "s2" : u < 0.9 ? "s3" : "s4"; };
  for (let y = 5; y < 105; y += 10) {
    for (let x = X0 - 10; x < X1 + 10; x += 19) {
      let px = x + between(-7, 7), py = y + between(-3, 3);
      if (whirls.some(([cx, cy, R]) => Math.hypot(px - cx, py - cy) < R * 0.95)) continue;
      const pts = [[px, py]];
      for (let k = 0; k < 4; k++) { const [vx, vy] = flow(px, py); px += vx * 3.8; py += vy * 3.8; pts.push([px, py]); }
      const [a, , m, , b] = pts; // a curve through the middle point
      sky(tone(y), `M${i(a[0])} ${i(a[1])}q${r(2 * m[0] - (a[0] + b[0]) / 2 - a[0])} ${r(2 * m[1] - (a[1] + b[1]) / 2 - a[1])} ${r(b[0] - a[0])} ${r(b[1] - a[1])}`);
    }
  }
  // the whirls: a spiral of broken strokes winding out from a light eye
  for (const [cx, cy, R] of whirls) {
    for (let a = rnd() * 6; ; ) {
      const rad = 3 + (5.5 * a) / (2 * Math.PI);
      if (rad > R) break;
      const span = 11 / rad, a1 = a + span * between(0.6, 0.8), rad1 = 3 + (5.5 * a1) / (2 * Math.PI), am = (a + a1) / 2, rm = (rad + rad1) / 2 / Math.cos((a1 - a) / 2);
      const x0 = cx + Math.cos(a) * rad, y0 = cy + Math.sin(a) * rad;
      sky(["s4", "s3", "s4", "s2", "s3", "s1", "s2", "s1"][Math.floor(a / (2 * Math.PI)) % 8],
        `M${i(x0)} ${i(y0)}q${r(cx + Math.cos(am) * rm - x0)} ${r(cy + Math.sin(am) * rm - y0)} ${r(cx + Math.cos(a1) * rad1 - x0)} ${r(cy + Math.sin(a1) * rad1 - y0)}`);
      a += span;
    }
  }

  // ---------- the skyline (2 px/m) ----------
  // shops (5 px/m) stand along these stretches; they and the viaduct deck hide the skyline behind them
  const shopRows = [[180, 470], [560, 890], [1110, 1272], [1730, 1866], [2214, 2560], [2660, 2820]];
  const hidden = (x, w, y) => (y > 99 && y < 115) || (y > 112 && shopRows.some(([a, b]) => x >= a && x + w <= b));

  // a hazy row far off
  const haze = drawing(["haze", "ink4"]);
  for (let x = X0 - 20; x < X1;) {
    const w = between(28, 64), h = between(30, 92);
    haze("haze", box(x, FAR - h, w, h + 2)); haze("ink4", outline(x, FAR - h, w, h, 0.6));
    x += w + between(1, 8);
  }

  const far = drawing(["w1", "w2", "w3", "w4", "w5", "stone", "glass", "temple", "shade", "tank", "hatch", "shadeh", "refl", "wrow", "vrow", "lit", "ink3", "t1", "t2", "t3", "gold", "fl"]);
  const keep = [[1026, 1098], [1284, 1716], [1874, 1946], [2150, 2212]]; // landmarks keep their spot
  const clear = (a, b) => keep.every(([c, d]) => b < c || a > d);

  // blocks of flats and offices, some 20 storeys: a line at each floor (3 m), windows, shade on one side, Sintex
  // water tanks and now and then a mobile tower on the roof
  const block = (x, w, floors) => {
    const h = floors * 6 + 3, top = FAR - h;
    far(pick(["w1", "w2", "w3", "w4", "w5"]), box(x, top, w, h + 4)); far("ink3", outline(x, top, w, h + 4, 0.6));
    const n = Math.ceil((w - 7.5) / 6);
    for (let f = 0; f < floors; f++) {
      const y = top + 5 + f * 6;
      if (hidden(x, w, y)) continue;
      if (f && rnd() < 0.4) far("hatch", pen(x + 1, y - 2, x + w - 1, y - 2, 0.3));
      far("wrow", `M${r(x + 3.5)} ${y}h${(n - 1) * 6 + 2}`);
      for (let k = 0; k < n; k++) if (rnd() < 0.24) far("lit", `M${r(x + 3.5 + k * 6)} ${y}h2`);
    }
    far("shadeh", `M${r(x + w - 3)} ${top + 3}V${FAR}M${r(x + w - 5.4)} ${top + 6}V${FAR}`);
    for (let t = 0, n2 = Math.floor(between(0, 3.4)); t < n2; t++) far("tank", box(x + 3 + between(0, w - 8), top - 2.6, 2.4, 2.6));
    if (rnd() < 0.07) { const mx = x + w / 2; far("ink3", `M${r(mx - 3)} ${top}L${r(mx)} ${top - 30}L${r(mx + 3)} ${top}M${r(mx - 2.2)} ${top - 8}L${r(mx + 1.6)} ${top - 18}M${r(mx + 2.2)} ${top - 8}L${r(mx - 1.6)} ${top - 18}`); }
  };
  for (let x = X0 - 24; x < X1;) {
    const w = between(36, 80);
    if (clear(x, x + w)) block(x, w, rnd() < 0.24 ? i(between(13, 20)) : i(between(4, 12)));
    x += w + between(3, 14);
  }

  // Vidhana Soudha: granite block, three floors of windows, corner pavilions with small domes, a 12-column portico on a
  // grand stair, and the central dome with the lion emblem 46 m up
  const soudha = () => {
    far("stone", box(1290, 116, 420, 44)); far("ink3", outline(1290, 116, 420, 44, 0.5));
    far("ink3", rule(1290, 1710, 152, 0.3, 140) + rule(1286, 1714, 116, 0.3, 140) + rule(1288, 1712, 118.5, 0.3, 140));
    for (const y of [122, 131, 140]) {
      far("vrow", `M1295.2 ${y + 2.2}H1452M1547.2 ${y + 2.2}H1705`);
      for (let x = 1296; x < 1705; x += 8) if ((x < 1452 || x > 1548) && rnd() < 0.2) far("lit", `M${x} ${y}v4.4`);
    }
    for (let x = 1324; x < 1705; x += 32) if (x < 1452 || x > 1548) far("hatch", `M${x} 120v31`); // pilasters
    for (const [x, w] of [[1290, 36], [1674, 36]]) {
      far("stone", box(x, 104, w, 12)); far("ink3", outline(x, 104, w, 12, 0.4));
      const c = x + w / 2;
      far("stone", `M${c - 10} 104Q${c - 10} 94 ${c} 93Q${c + 10} 94 ${c + 10} 104Z`); far("ink3", `M${c - 10} 104Q${c - 10} 94 ${c} 93Q${c + 10} 94 ${c + 10} 104M${c} 93v-4`);
    }
    // stair and portico
    far("stone", "M1448 160L1462 146H1538L1552 160Z");
    for (let s = 0; s < 7; s++) far("hatch", pen(1450 + s * 2, 160 - s * 2, 1550 - s * 2, 160 - s * 2, 0.2));
    far("stone", box(1460, 110, 80, 36)); far("shade", box(1464, 124, 72, 22));
    for (let k = 0; k < 12; k++) { const x = 1466.5 + k * 6.1; far("stone", box(x - 1, 124, 2.2, 22)); far("ink3", `M${r(x - 1)} 146V124M${r(x + 1.2)} 146V124`); }
    far("ink3", outline(1460, 118, 80, 28, 0.4) + rule(1458, 1542, 124, 0.3, 90) + lines([[1462, 118], [1470, 110], [1530, 110], [1538, 118]], 0.3));
    // central tower, drum and dome
    far("stone", box(1474, 98, 52, 18)); far("ink3", outline(1474, 98, 52, 18, 0.4));
    for (const x of [1482, 1498, 1514]) far("ink3", `M${x} 114v-7a2 2 0 0 1 4 0v7`);
    far("stone", box(1479, 94, 42, 4)); far("ink3", outline(1479, 94, 42, 4, 0.3));
    far("stone", "M1479 94C1479 80 1489 74 1500 74C1511 74 1521 80 1521 94Z");
    far("ink3", "M1479 94C1479 80 1489 74 1500 74C1511 74 1521 80 1521 94M1490 94Q1491 81 1500 74M1510 94Q1509 81 1500 74M1500 94V74");
    for (let k = 0; k < 5; k++) far("hatch", dab(1513 + k * 1.4, 80 + k * 2.6, 1.6, 4));
    far("gold", "M1498.6 74v-4h2.8v4zM1496.4 70q3.6-2.6 7.2 0zM1498.5 68v-3q1.5-1.6 3 0v3z");
  };
  soudha();

  // a Dravidian gopuram: stone base with a doorway, six painted tiers full of figures, a barrel-vault top with kalasas
  const gopuram = (c) => {
    far("stone", box(c - 30, 134, 60, 26)); far("ink3", outline(c - 30, 134, 60, 26, 0.4));
    far("shade", `M${c - 6} 160v-13a6 6 0 0 1 12 0v13z`);
    for (let t = 0; t < 6; t++) {
      const y1 = 134 - t * 8.7, y0 = y1 - 8.7, w1 = 56 - t * 4.4, w0 = w1 - 4.4;
      far("temple", `M${r(c - w1 / 2)} ${r(y1)}L${r(c - w0 / 2)} ${r(y0)}H${r(c + w0 / 2)}L${r(c + w1 / 2)} ${r(y1)}Z`);
      far("ink3", pen(c - w1 / 2 - 1.5, y1, c + w1 / 2 + 1.5, y1, 0.3) + pen(c - w1 / 2, y1, c - w0 / 2, y0, 0.3) + pen(c + w1 / 2, y1, c + w0 / 2, y0, 0.3));
      for (let x = c - w0 / 2 + 2; x < c + w0 / 2 - 1; x += 3) far(pick(["t1", "t2", "t3"]), `M${r(x)} ${r(y1 - 1.5)}v-4.6`);
    }
    far("temple", `M${c - 15} 82v-6q0-4 4-4h22q4 0 4 4v6z`); far("ink3", `M${c - 15} 82v-6q0-4 4-4h22q4 0 4 4v6M${c - 17} 82h34`);
    for (let k = -2; k <= 2; k++) far("gold", `M${c + k * 6 - 1} 72h2l-1-4.4z`);
  };
  gopuram(1062);

  // glass tech-park towers: mullions every 3 m, floors every 4 m, reflections, lit floors at night
  const tower = (x, w, h, crown) => {
    const top = FAR - h;
    far("glass", box(x, top, w, h));
    let grid = "";
    for (let mx = x + 6; mx < x + w - 2; mx += 6) grid += `M${mx} ${top + 1}V${FAR}`;
    for (let fy = top + 8; fy < FAR; fy += 8) { grid += `M${x} ${fy}h${w}`; if (rnd() < 0.3 && !hidden(x, w, fy)) far("lit", `M${x + 2 + Math.floor(rnd() * (w / 6 - 1)) * 6} ${fy + 4}h4`); }
    far("hatch", grid);
    for (let k = 0; k < h / 6; k++) far("refl", dab(x + 2 + rnd() * (w - 10), top + 4 + rnd() * (h - 10), -0.85, between(4, 9)));
    far("ink3", outline(x, top, w, h, 0.6));
    if (crown) far("ink3", `M${x + 5} ${top}v-10h${w - 10}v10M${x + 5} ${top - 5}h${w - 10}M${x + w / 2} ${top - 10}v-12`);
  };
  tower(1880, 60, 116, false); tower(2156, 50, 132, true);

  // far trees: the Garden City between the blocks
  for (let k = 0; k < 30; k++) {
    const x = between(X0, X1), cy = FAR - between(4, 9);
    if (!clear(x - 8, x + 8) || shopRows.some(([a, b]) => x > a && x < b)) continue;
    for (let d = 0; d < 9; d++) far("fl", dab(x + between(-8, 6), cy + between(-5, 4), between(-1, 1) - 0.4, 3.5));
  }

  // ---------- the viaduct row (5 px/m) ----------
  // two- and three-storey shops: painted signboards with Kannada-like lettering, rolling shutters, grilles, bougainvillea
  const row = drawing(["v1", "v2", "v3", "v4", "v5", "shade", "shut", "sg1", "sg2", "sg3", "sg4", "tank", "hatch2", "fence", "ink2", "tw", "tk", "bougain", "grass", "grass2"]);
  const shop = (x, w) => {
    const floors = rnd() < 0.6 ? 2 : 3, top = MIDG - floors * 16 - 3;
    row(pick(["v1", "v2", "v3", "v4", "v5"]), box(x, top, w, MIDG - top)); row("ink2", outline(x, top, w, MIDG - top, 0.5) + pen(x - 1.5, top + 3, x + w + 1.5, top + 3, 0.3));
    if (rnd() < 0.7) { const tx = r(x + between(3, w - 9)); row("tank", `M${tx} ${top}v-5q0-1.4 3-1.4t3 1.4v5z`); row("ink2", `M${tx} ${top}v-5q0-1.4 3-1.4t3 1.4v5`); }
    for (let f = 1; f < floors; f++) {
      const fy = MIDG - (f + 1) * 16;
      for (let wx = x + 5; wx + 8 < x + w - 2; wx += 13) {
        row("shade", box(wx, fy + 5, 7, 7)); row("hatch2", `M${r(wx + 2.3)} ${fy + 5}v7m2.4-7v7`);
        row("ink2", pen(wx - 1.5, fy + 4, wx + 8.5, fy + 4, 0.3));
      }
      row("ink2", pen(x, fy + 16, x + w, fy + 16, 0.3));
    }
    const gy = MIDG - 16, sg = pick(["sg1", "sg2", "sg3", "sg4"]);
    row(sg, box(x + 1.5, gy + 1, w - 3, 5));
    let t = `M${r(x + 4 + between(0, 4))} ${gy + 5}`;
    for (let k = 0, n = Math.floor((w - 12) / 3.6); k < n; k++) t += rnd() < 0.3 ? "a1 1 0 1 1 1.6-.8m1.4.8" : "q0-2.6 1.2-2.6t1.2 1.4m1.2 1.2";
    row(sg === "sg3" ? "tk" : "tw", t);
    const open = between(3, 8);
    row("shade", box(x + 3, gy + 7, w - 6, 9)); row("shut", box(x + 3, gy + 7, w - 6, open));
    let slats = "";
    for (let sy = gy + 8.2; sy < gy + 7 + open; sy += 1.6) slats += `M${r(x + 3)} ${r(sy)}h${r(w - 6)}`;
    row("hatch2", slats);
    for (let gx = x + 5; gx < x + w - 6; gx += between(2.5, 4)) row(pick(["sg1", "sg2", "sg3", "sg4"]), box(gx, MIDG - between(2, 4), 1.8, 2));
    if (rnd() < 0.4) {
      const bx = rnd() < 0.5 ? x + 2 : x + w - 2;
      for (let k = 0; k < 11; k++) row("bougain", dab(bx + between(-4, 4), top + 3 + between(0, 12), between(0, Math.PI), 2.4));
    }
  };
  for (const [a, b] of shopRows) {
    for (let x = a; x < b - 24;) { const w = Math.min(between(26, 46), b - x); shop(x, w); x += w + (rnd() < 0.3 ? between(4, 12) : 0); }
  }
  // the railing round Vidhana Soudha's lawn, with gate posts at the stair
  for (const [a, b] of [[1290, 1458], [1542, 1710]]) { row("fence", `M${a} ${MIDG - 3}H${b}`); row("ink2", rule(a, b, MIDG - 5.5, 0.3, 84) + rule(a, b, MIDG - 1, 0.3, 84)); }
  for (const x of [1456, 1541]) { row("v4", box(x, MIDG - 10, 3.5, 10)); row("ink2", outline(x, MIDG - 10, 3.5, 10, 0.3)); }
  // grass along the row: two rows of slanted blades
  row("grass", `M${X0} ${MIDG - 1.6}H${X1 + 40}`); row("grass2", `M${X0 - 40} ${MIDG - 1.4}H${X1}`);

  // trees: crowns of swirling brush marks over a filled shape that hides what's behind
  const crownOf = (dr, cx, cy, rx, ry, flat, bloom, share) => {
    const n = 16, pts = [];
    for (let k = 0; k < n; k++) {
      const t = (k / n) * 2 * Math.PI, f = between(0.9, 1.05);
      pts.push([cx + Math.cos(t) * rx * f, Math.min(cy + ry * flat, cy + Math.sin(t) * ry * f)]);
    }
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
    for (let k = 0; k < n; k++) {
      const a = pts[k], b = pts[(k + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      d += `Q${r(mx + (mx - cx) * 0.16)} ${r(my + (my - cy) * 0.16)} ${r(b[0])} ${r(b[1])}`;
    }
    dr("crown", d + "Z");
    for (let k = 0, count = i((Math.PI * rx * ry) / 30); k < count; k++) {
      const t = 2 * Math.PI * rnd(), u = Math.sqrt(rnd()), x = cx + Math.cos(t) * u * rx * 0.9, y = cy + Math.sin(t) * u * ry * 0.88;
      if (y > cy + ry * flat - 1.5) continue;
      const lit = -(x - cx) / rx - (y - cy) / ry;
      const cls = bloom && rnd() < share ? bloom : lit > 0.55 && rnd() < 0.7 ? "l3" : rnd() < 0.55 ? "l1" : "l2";
      dr(cls, dab(x, y, Math.atan2(y - cy, x - cx) + Math.PI / 2 + between(-0.5, 0.5), between(4.5, 7)));
    }
  };
  const trunk = (dr, x, g, top, wb, wt) => dr("trunk", `M${r(x - wb)} ${g}Q${r(x - wt * 1.2)} ${r((g + top) / 2)} ${r(x - wt)} ${r(top)}h${r(wt * 2)}Q${r(x + wt * 1.2)} ${r((g + top) / 2)} ${r(x + wb)} ${g}Z`);
  const tree = {
    // rain tree: 20 m tall, a 26 m umbrella of a crown on wide-spread branches
    rain(dr, x, g, s = 1) {
      const top = g - 100 * s, cy = top + 24 * s;
      trunk(dr, x, g, g - 36 * s, 3 * s, 1.8 * s);
      for (const [dx, dy] of [[-48, 6], [-26, 0], [4, -4], [28, 2], [50, 8]]) dr("branch", `M${r(x)} ${r(g - 34 * s)}Q${r(x + dx * 0.35 * s)} ${r(cy + 22 * s)} ${r(x + dx * s)} ${r(cy + (10 + dy) * s)}`);
      crownOf(dr, x, cy, 66 * s, 26 * s, 0.5);
    },
    // gulmohar in flame: 12 m, a broad flat-topped crown, half red-orange blooms
    flame(dr, x, g, s = 1) {
      const top = g - 64 * s, cy = top + 14 * s;
      trunk(dr, x, g, cy + 8 * s, 2.4 * s, 1.4 * s);
      for (const dx of [-24, -8, 10, 24]) dr("branch", `M${r(x)} ${r(g - 26 * s)}Q${r(x + dx * 0.4 * s)} ${r(cy + 14 * s)} ${r(x + dx * s)} ${r(cy + 6 * s)}`);
      crownOf(dr, x, cy, 36 * s, 15 * s, 0.6, "flame", 0.55);
    },
    // pink trumpet tree (tabebuia) in March: 13 m, a round crown thick with pink
    pink(dr, x, g, s = 1) {
      const top = g - 68 * s, cy = top + 22 * s;
      trunk(dr, x, g, cy + 12 * s, 2.2 * s, 1.3 * s);
      for (const dx of [-14, 0, 14]) dr("branch", `M${r(x)} ${r(g - 24 * s)}Q${r(x + dx * 0.3 * s)} ${r(cy + 14 * s)} ${r(x + dx * s)} ${r(cy + 4 * s)}`);
      crownOf(dr, x, cy, 27 * s, 22 * s, 0.75, "pink", 0.62);
    },
    // coconut palm: 18 m, a leaning ringed trunk and drooping fronds of leaflets
    palm(dr, x, g, s = 1) {
      const lean = between(-10, 10) * s, tx = x + lean, ty = g - 90 * s, my = g - 50 * s;
      dr("palm", `M${r(x)} ${g}Q${r(x + lean * 0.1)} ${r(my)} ${r(tx)} ${r(ty)}`);
      let rings = "";
      for (let t = 0.08; t < 0.95; t += 0.07) rings += `M${r(x + 0.2 * lean * t * (1 - t) + lean * t * t - 1.3)} ${r(g + 2 * (my - g) * t * (1 - t) + (ty - g) * t * t)}h2.6`;
      dr("hatch2", rings);
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI / 2 + (k - 3.5) * 0.46 + between(-0.12, 0.12), L = between(19, 25) * s, droop = Math.abs(k - 3.5) * 2.6 * s + 3 * s;
        const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L + droop, qx = tx + Math.cos(a) * L * 0.6, qy = ty + Math.sin(a) * L * 0.6 - 3 * s;
        let f = `M${r(tx)} ${r(ty)}Q${r(qx)} ${r(qy)} ${r(ex)} ${r(ey)}`;
        for (let t = 0.25; t < 0.96; t += 0.14) {
          const bx = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * qx + t * t * ex, by = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * qy + t * t * ey;
          const ang = Math.atan2(2 * (1 - t) * (qy - ty) + 2 * t * (ey - qy), 2 * (1 - t) * (qx - tx) + 2 * t * (ex - qx)), l = 5.5 * s * (1 - t * 0.45);
          for (const side of [-1, 1]) f += `M${r(bx)} ${r(by)}l${r(Math.cos(ang + side * 0.8 + 0.35) * l)} ${r(Math.sin(ang + side * 0.8 + 0.35) * l + 1.2 * s)}`;
        }
        dr("frond", f);
      }
      dr("nut", `M${r(tx - 2)} ${r(ty + 3)}a1.5 1.5 0 1 0 .1 0M${r(tx + 1.5)} ${r(ty + 3.6)}a1.5 1.5 0 1 0 .1 0`);
    },
  };
  const treeOrder = ["trunk", "branch", "palm", "hatch2", "crown", "l1", "l2", "l3", "flame", "pink", "frond", "nut"];
  const backTrees = drawing(treeOrder);
  for (const [kind, x, s] of [["rain", 210, 0.95], ["palm", 370, 1], ["rain", 530, 1.05], ["palm", 770, 0.95], ["rain", 935, 1], ["palm", 1332, 1],
    ["palm", 1968, 1.05], ["rain", 2050, 0.95], ["palm", 2296, 1], ["rain", 2625, 1.05], ["palm", 2770, 0.95]]) tree[kind](backTrees, x, MIDG, s);

  // the viaduct's piers every 30 m, hammerhead caps under the deck
  const piers = drawing(["conc", "hatch2", "ink2"]);
  for (let x = MID - 75 - 1200; x < X1 + 20; x += 150) {
    piers("conc", `M${x - 4.5} ${MIDG + 2}V122L${x - 14} ${DECK}H${x + 14}L${x + 4.5} 122V${MIDG + 2}Z`);
    piers("ink2", lines([[x - 4.5, MIDG + 2], [x - 4.5, 122], [x - 14, DECK]], 0.4) + lines([[x + 14, DECK], [x + 4.5, 122], [x + 4.5, MIDG + 2]], 0.4));
    let h = `M${x + 1.2} 125`;
    for (let y = 125; y < MIDG; y += 4) h += "l2.6-2.2m-2.6 6.2";
    piers("hatch2", h);
  }

  // in front of the train: the deck and its parapet hide the wheels; then trees on the near side of the viaduct
  const deck = drawing(["conc", "joint", "hatch2", "ink2"]);
  deck("conc", box(X0 - 5, 101, X1 - X0 + 10, DECK - 101));
  deck("joint", `M${MID - 75 - 1200} 110H${X1 + 5}`);
  deck("ink2", rule(X0 - 5, X1 + 5, 101, 0.4) + rule(X0 - 5, X1 + 5, RAIL, 0.3) + rule(X0 - 5, X1 + 5, DECK, 0.4));
  let under = `M${X0} ${DECK - 0.6}`, spans = "";
  for (let x = X0; x < X1; x += 9) under += "l3-2.4m6 2.4";
  for (let x = MID - 75 - 1200; x < X1; x += 150) spans += `M${x} 101.5v12`;
  deck("hatch2", under + spans);
  const nearTrees = drawing(treeOrder);
  for (const [kind, x, s] of [["pink", 610, 1.05], ["flame", 1150, 1.1], ["pink", 1858, 1.05], ["flame", 2440, 1.1]]) tree[kind](nearTrees, x, WALK - 2, s);

  // ---------- the footpath (14 px/m) and the road ----------
  const street = drawing(["walk", "pave", "kerbk", "kerby", "glowfill", "glow", "cow", "dog", "lamphead", "bulb", "horn", "pole", "ink1", "ink4"]);
  street("walk", box(X0 - 5, 166, X1 - X0 + 10, 3));
  street("pave", `M${X0} 167.6H${X1}`);
  // painted kerb stones, black and yellow, a metre each
  street("kerbk", `M${X0 - 5} 171.5H${X1 + 5}`); street("kerby", `M${X0 - 7} 171.5H${X1 + 5}`);
  street("ink1", rule(X0 - 5, X1 + 5, 169.2, 0.3, 120) + rule(X0 - 5, X1 + 5, 173.8, 0.3, 120));
  let road = "";
  for (let k = 0; k < 220; k++) road += `M${i(between(X0, X1))} ${r(between(176.5, 183))}h${r(between(3, 9))}`;
  street("ink4", road);
  // street lamps, 8.5 m, with a Van Gogh glow at night
  for (const x of [1250, 1722]) {
    street("pole", `M${x} ${WALK}V54q0-7 7-7h6`); street("ink1", box(x - 1.6, WALK - 7, 3.2, 7));
    street("lamphead", `M${x + 11} 45h10l-1.6 3.4h-6.8z`); street("bulb", box(x + 12.8, 48.2, 6.4, 1.2));
    const gx = x + 16, gy = 50;
    street("glowfill", `M${gx - 18} ${gy}a18 18 0 1 0 36 0a18 18 0 1 0-36 0`);
    for (const rad of [6, 11, 17, 24]) street("glow", `M${gx - rad} ${gy}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0-${rad * 2} 0`);
  }
  // a zebu cow resting on the footpath (2 m long): hump, head up, dewlap, folded legs, horns painted for Sankranti
  const cow = (x) => {
    const body = `M${x + 1} ${WALK}Q${x - 1} 163 ${x + 2} 159.5Q${x + 3} 154 ${x + 7} 154.6Q${x + 10} 155.4 ${x + 12} 157.4Q${x + 20} 156.6 ${x + 25} 158.4Q${x + 28.5} 161 ${x + 26.5} ${WALK}Z`;
    const head = `M${x + 3} 158L${x - 1.5} 156.2Q${x - 3.4} 155.8 ${x - 4.4} 157L${x - 7.8} 160.4Q${x - 8.2} 162 ${x - 6.6} 162.2L${x - 2.4} 161.4Q${x - 1} 163.6 ${x + 1} 165.2L${x + 2} 160Z`;
    street("cow", body + head);
    street("ink4", `M${x + 8} 157.6q3 3 2 9M${x + 18} 159q2 4 0 8.4M${x + 22} 159.4q1.6 3.6 0 8`);
    street("ink1", body.slice(0, -1) + head.slice(0, -1) + `M${x - 2} 157.4q2.4 0 3.6 1.6q-2.4.4-3.6-1.6M${x - 3} 156.2q-.4-2.6 1.2-4M${x - 1.6} 156q.6-2.4 2.4-3` +
      `M${x - 4.2} 158.2h.1M${x + 3} ${WALK}q2.6-1.6 6.4-.4M${x + 26.6} 161.6q3 2 1.6 6.2`);
    street("horn", `M${x - 2.6} 153.2l1-1M${x + 0.2} 153.4l1.2-.4`);
  };
  cow(1640);
  const dog = (x) => {
    const d = `M${x} ${WALK}Q${x - 0.6} 163.4 ${x + 5} 163Q${x + 10.4} 163 ${x + 11} ${WALK}Z`;
    street("dog", d); street("ink1", d.slice(0, -1) + `M${x + 1} 164.4l-1-2.4 2.6.8M${x + 11} 166.6q2.6-.4 1.8-2.4M${x + 1.6} 165.6h.1`);
  };
  dog(1366);

  const svg = (cls, body) => `<svg class="${cls}" viewBox="${X0} 0 ${X1 - X0} ${H}" preserveAspectRatio="xMidYMax slice">${body}</svg>`;
  const paint = svg("blr__paint", sky.svg());
  const back = svg("blr__back", haze.svg() + far.svg() + row.svg() + backTrees.svg() + piers.svg());
  const front = svg("blr__front", deck.svg() + nearTrees.svg() + street.svg());

  // ---------- movers, each drawn to the scale of its depth ----------
  // Namma Metro, 3 coaches of 21 m (5 px/m): stainless steel, purple livery, four doors a side, cabs at both ends,
  // people in the windows. It runs on a third rail, so there's no pantograph. Heading right.
  const mp = { body: "", pur: "", door: "", glass: "", win: "", pax: "", roof: "", gang: "", ink: "" };
  for (let c = 0; c < 3; c++) {
    const x0 = c * 108.5, end = c === 0 ? -1 : c === 2 ? 1 : 0;
    const body = end === 1 ? `M${x0} 2H${x0 + 98}Q${x0 + 103.6} 2 ${x0 + 104.4} 7L${x0 + 105} 19H${x0}Z`
      : end === -1 ? `M${x0 + 105} 2H${x0 + 7}Q${x0 + 1.4} 2 ${x0 + 0.6} 7L${x0} 19H${x0 + 105}Z`
      : `M${x0} 3.5Q${x0} 2 ${x0 + 1.5} 2H${x0 + 103.5}Q${x0 + 105} 2 ${x0 + 105} 3.5V19H${x0}Z`;
    mp.body += body; mp.ink += body;
    mp.pur += box(x0, 11.2, 105, 1.5) + box(x0 + 1, 2.9, 103, 0.7);
    if (end === 1) mp.pur += `M${x0 + 99} 10H${x0 + 104.6}L${x0 + 105} 19H${x0 + 99}Z`, mp.glass += `M${x0 + 100} 3.6Q${x0 + 103.2} 3.6 ${x0 + 103.9} 7.6L${x0 + 104.1} 9.4H${x0 + 100}Z`;
    if (end === -1) mp.pur += `M${x0 + 6} 10H${x0 + 0.4}L${x0} 19H${x0 + 6}Z`, mp.glass += `M${x0 + 5} 3.6Q${x0 + 1.8} 3.6 ${x0 + 1.1} 7.6L${x0 + 0.9} 9.4H${x0 + 5}Z`;
    const doors = [14.7, 39.9, 65.1, 90.3].map((f) => x0 + f);
    for (const d of doors) {
      mp.door += box(d - 3.5, 4.4, 7, 14.6); mp.ink += `M${r(d)} 4.4V19` + box(d - 3.5, 4.4, 7, 14.6);
      mp.win += box(d - 2.9, 5.6, 2.3, 4.6) + box(d + 0.6, 5.6, 2.3, 4.6);
    }
    const edges = [end === -1 ? x0 + 8 : x0 + 2.5, ...doors.flatMap((d) => [d - 4.5, d + 4.5]), end === 1 ? x0 + 97 : x0 + 102.5];
    for (let g = 0; g < edges.length; g += 2) {
      const a = edges[g], b = edges[g + 1], n = Math.max(1, Math.floor((b - a + 1.5) / 10.5)), w = (b - a - (n - 1) * 1.5) / n;
      for (let k = 0; k < n; k++) {
        const wx = a + k * (w + 1.5);
        mp.win += box(wx, 5, w, 5);
        if (rnd() < 0.5) { const hx = wx + between(1.6, w - 1.6); mp.pax += `M${r(hx - 1.1)} 8.4a1.1 1.1 0 1 1 2.2 0a1.1 1.1 0 1 1-2.2 0M${r(hx - 2)} 10q2-1.6 4 0z`; }
      }
    }
    if (end === 1) mp.win += box(x0 + 95.6, 5, 3, 5);
    if (end === -1) mp.win += box(x0 + 6.4, 5, 3, 5);
    mp.roof += box(x0 + 20, 0.5, 16, 1.6) + box(x0 + 69, 0.5, 16, 1.6);
    if (c < 2) mp.gang += box(x0 + 105, 4, 3.5, 14);
  }
  // headlight beams fade out ahead (shown after dark)
  const beam = (id, x1, x2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" x2="${x2}" y1="0" y2="0"><stop offset="0" class="beam-0"/><stop offset="1" class="beam-1"/></linearGradient>`;
  const metro = `<svg class="blr__mover blr__metro" viewBox="0 0 322 21"><defs>${beam("blr-beam-m", 322, 372)}</defs><path class="blr__beam" fill="url(#blr-beam-m)" d="M322 13.6L372 7.5V20.5L322 15.2Z"/>` +
    Object.entries(mp).map(([k, d]) => `<path class="m-${k}" d="${tidy(d)}"/>`).join("") +
    `<circle class="m-lamp" cx="321.6" cy="14.4" r=".9"/><circle class="m-tail" cx=".6" cy="14.4" r=".8"/></svg>`;

  // auto rickshaw (18 px/m): 2.6 m long, 1.7 m tall; yellow hood, green body, a driver in khaki, a passenger,
  // lemon-and-chillies for luck. Heading left.
  const autoBody = "M2.2 26.5Q1.9 21 4.2 18.4Q6.2 15.6 8.6 13.5H11.2L12.1 21H48.9Q49.5 21 49.5 22V27.6H49.7A5.2 5.2 0 0 0 39.3 27.6H13.6A5.1 5.1 0 0 0 3.4 27.5Z";
  const autoHood = "M8.6 13.5L9.8 6Q10.8 2.9 15.5 2.9H41.5Q48.6 2.9 48.9 9.5V21H44V9.8Q44 7.4 41.5 7.4H15Q12.7 7.4 12.3 9L11.2 13.5Z";
  const wheel = (cx, cy, rr) => `<g class="a-wheel" style="transform-origin:${cx}px ${cy}px"><circle class="a-tyre" cx="${cx}" cy="${cy}" r="${rr}"/>` +
    `<circle class="a-hub" cx="${cx}" cy="${cy}" r="${r(rr * 0.42)}"/><path class="a-spoke" d="M${cx} ${r(cy - rr * 0.42)}V${r(cy + rr * 0.42)}M${r(cx - rr * 0.42)} ${cy}H${r(cx + rr * 0.42)}"/></g>`;
  const auto = `<svg class="blr__mover blr__auto" viewBox="0 0 50 34"><defs>${beam("blr-beam-a", 2.4, -30)}</defs><path class="blr__beam" fill="url(#blr-beam-a)" d="M2.4 18.4L-30 12.5V27.5L2.4 20.8Z"/><g class="blr__bump">` +
    `<path class="a-in" d="M11 7.4H44V21H11Z"/>` +
    `<path class="a-khaki" d="M14 12.8Q16 11.2 18.6 12.5L19.6 20H14.4Z"/><path class="a-shirt" d="M32.4 13Q35 11.6 37.6 13L38.6 20H31.8Z"/>` +
    `<circle class="a-skin" cx="16.4" cy="9.8" r="2.1"/><circle class="a-skin" cx="35" cy="10.3" r="2.1"/>` +
    `<path class="a-hair" d="M14.4 9.6a2.1 2.1 0 0 1 4-.8l-1.6.2zM33 10a2.1 2.1 0 0 1 4-.6l-1 .3z"/>` +
    `<path class="a-line" d="M15 14L11.6 14.4M40.6 9.6V20.6M24 7.6V21"/>` +
    `<path class="a-hood" d="${autoHood}"/><path class="a-stitch" d="M14 4.9H42M46.5 8V19"/>` +
    `<path class="a-body" d="${autoBody}"/><path class="a-stitch" d="M13 23.6H39M3.6 23.4Q4.6 19.4 8 16.6"/>` +
    `<path class="a-glass" d="M9.6 7.2L8.9 12.8"/><path class="a-nimbu" d="M11.1 13.6v2.2"/><circle class="a-lemon" cx="11.1" cy="16.4" r=".8"/><path class="a-chilli" d="M10.6 16.9l-.3 2M11.6 16.9l.3 2"/>` +
    `<path class="a-ink" d="${autoHood}${autoBody}"/><circle class="a-lamp" cx="3.3" cy="19.6" r="1.3"/><path class="a-tail" d="M49.2 22.2h.9v2h-.9z"/></g>` +
    wheel(8.5, 29.5, 4) + wheel(44.5, 29.5, 4) + `</svg>`;

  // flower seller (18 px/m): a 1.55 m woman in a sari, jasmine in her hair, pushing a 2 m wooden cart of marigold,
  // jasmine and roses under a striped umbrella, marigold and jasmine garlands hanging from its rod. Heading right.
  let blooms = "";
  const heap = (cls, x0, x1, top, n) => {
    let s = "";
    for (let k = 0; k < n; k++) { const x = between(x0, x1), h = 1 - Math.abs((x - (x0 + x1) / 2) / ((x1 - x0) / 2)); s += `M${r(x)} ${r(31 - 0.6 - rnd() * h * (31 - top - 1))}h.1`; }
    blooms += `<path class="${cls}" d="${s}"/>`;
  };
  heap("f-mari2", 27.6, 43, 24, 26); heap("f-jas2", 43.6, 51.4, 26.4, 14); heap("f-rose2", 52, 61.4, 25.4, 16);
  const garland = (x, w, cls) => { let s = ""; for (let k = 0; k <= 8; k++) { const t = k / 8; s += `M${r(x + t * w)} ${r(13.4 + Math.sin(t * Math.PI) * 7)}h.1`; } return `<path class="${cls}" d="${s}"/>`; };
  const cartWheel = (cx) => `<g class="f-wheel" style="transform-origin:${cx}px 40.1px"><circle class="f-rim" cx="${cx}" cy="40.1" r="5.4"/><path class="f-spoke" d="` +
    [0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 4, dx = Math.cos(a) * 5.4, dy = Math.sin(a) * 5.4; return `M${r(cx - dx)} ${r(40.1 - dy)}L${r(cx + dx)} ${r(40.1 + dy)}`; }).join("") + `"/></g>`;
  const panels = [27, 32.7, 38.3, 44, 49.7, 55.3, 61];
  const umbrella = panels.slice(0, -1).map((x, k) => `<path class="f-u${(k % 4) + 1}" d="M44 3L${x} 10.6Q${r((x + panels[k + 1]) / 2)} 12.2 ${panels[k + 1]} 10.6Z"/>`).join("");
  const seller = `<svg class="blr__mover blr__seller" viewBox="0 0 70 46"><defs><clipPath id="blr-umb"><path d="M26.4 11Q28 3 44 2.6Q60 3 61.6 11Z"/></clipPath></defs>` +
    `<path class="f-wood" d="M44 31V4"/><path class="f-rod" d="M48.4 13.2H62"/>` + garland(48.8, 4.4, "f-garland") + garland(53.4, 3.8, "f-garland-w") + garland(57.4, 4.2, "f-garland") +
    `<g clip-path="url(#blr-umb)">${umbrella}</g><path class="f-ink" d="M26.6 10.8Q28.4 3 44 2.6Q59.6 3 61.4 10.8M44 2.6V1.2${panels.slice(1, -1).map((x) => `M44 3L${x} 10.6`).join("")}"/>` +
    `<path class="f-mari" d="M27 31Q28 24 35 23.4Q42 24 43.6 31Z"/><path class="f-jas" d="M43 31Q44 26.2 47.6 26Q51.2 26.4 52 31Z"/><path class="f-rose" d="M51.4 31Q53 25 56.8 25Q61 25.4 61.8 31Z"/>` +
    blooms + `<path class="f-leaf" d="M29 25.6l-2.4-3.4M41 25l1.8-3.8M60.6 27l2.6-2.8"/>` +
    `<path class="f-cart" d="M25.6 31H62.6V33.6H25.6ZM27 33.6H61V35H27Z"/><path class="f-ink" d="M25.6 31H62.6V33.6H25.6ZM27 35H61"/><path class="f-wood" d="M26 32.2L19.6 28.6"/>` +
    cartWheel(32) + cartWheel(56) +
    `<g class="f-walker"><path class="f-sari f-hem" d="M13.2 27H18.4Q19.6 36 20.8 44.8H10.8Q12 36 13.2 27Z"/><path class="f-border f-hem" d="M11 43.2H20.6L20.8 44.8H10.8Z"/>` +
    `<path class="f-pleat f-hem" d="M17.2 30.4L18.4 44M18.6 31L19.6 44"/><path class="f-blouse" d="M13.6 22.6Q15.8 21.9 17.6 23L18.2 27.4H13.4Z"/>` +
    `<path class="f-sari" d="M18.2 27.8L14.6 22.4Q12.6 22.8 12 25.6L11 33.6L12.6 33.6L13.6 26.2Z"/><path class="f-border-line" d="M12.1 25.6L11.1 33.4"/>` +
    `<path class="f-arm" d="M16.8 23.4L19.2 26.4L20.2 28.6"/><path class="f-bangle" d="M19.4 27.6h.1"/>` +
    `<circle class="f-skin" cx="15.4" cy="20" r="2.3"/><path class="f-hairc" d="M13.2 20.4a2.3 2.3 0 0 1 4.3-1.3q-1.6-.2-2.6.6z"/><circle class="f-hairc" cx="12.9" cy="20.6" r="1.3"/>` +
    `<path class="f-jasmine" d="M12.2 19.4h.1M13.6 19.2h.1M11.7 20.6h.1M12.1 22h.1M12.3 23.4h.1M12.4 24.8h.1"/>` +
    `<path class="f-foot f-foot--a" d="M13.6 45.4h2.2"/><path class="f-foot f-foot--b" d="M17.2 45.4h2.2"/></g></svg>`;

  // clouds in curls, kites (the birds) wheeling by day
  const cloud = (cls, flip) => {
    const a = curl(30, 15, 5, 1.1, flip ? 0 : 1), b = curl(52, 17, 4, 1.2, flip ? 1 : 0), c = curl(16, 20, 3, 1, 1);
    return `<svg class="blr__mover blr__cloud ${cls}" viewBox="0 0 90 30"><path class="c-fill" d="M6 25Q4 18 12 17Q14 8 26 9Q32 3 42 8Q52 5 58 11Q70 9 72 17Q84 18 82 25Z"/>` +
      `<path class="c-1" d="${tidy(a + c)}M8 25H80"/><path class="c-2" d="${tidy(b)}M14 27.6H62M66 21.6q6-1 10 2M38 6.6q6-2 12 1"/></svg>`;
  };
  const kite = (cls) => `<span class="blr__kite ${cls}"><svg viewBox="0 0 14 5"><path d="M1 3.6Q4 .4 7 3Q10 .4 13 3.6"/></svg></span>`;

  // the moon or sun, with rings of broken strokes round it as in The Starry Night
  const halo = `<svg class="blr__halo" viewBox="-34 -34 68 68">${[11, 16, 22, 29].map((rad, k) => `<circle r="${rad}" class="o-ring o-ring--${k}"/>`).join("")}</svg>`;
  const disc = `<svg class="blr__disc" viewBox="-10 -10 20 20"><defs><mask id="blr-crescent"><circle r="8" fill="#fff"/><circle cx="4" cy="-2.6" r="7" fill="#000"/></mask></defs>` +
    `<circle class="o-sun" r="7"/><circle class="o-moon" r="7.6" mask="url(#blr-crescent)"/></svg>`;
  const stars = Array.from({ length: 15 }, (_, k) => `<i style="left:${r((k * 61.8 + 7) % 100)}%;--y:${r(6 + ((k * 37) % 64))};animation-delay:-${r((k * 1.7) % 5)}s"></i>`).join("");

  const strip = document.createElement("div");
  strip.className = "blr";
  strip.setAttribute("aria-hidden", "true");
  strip.innerHTML = paint + `<div class="blr__stars">${stars}</div><span class="blr__orb">${halo}${disc}</span>` +
    cloud("blr__cloud--a", false) + cloud("blr__cloud--b", true) + kite("blr__kite--a") + kite("blr__kite--b") +
    back + metro + front + seller + auto;
  footer.before(strip);

  // scale: 1 on wide monitors, smaller on laptops like the rest of the site, 0.72 on phones, and larger on screens wider
  // than the drawing so the movers stay on their ground.
  // Speeds stay true on any screen: the metro 50 km/h, the auto 18 km/h in traffic, the seller walking, clouds drifting.
  const phone = window.matchMedia("(max-width: 599px)");
  const pace = () => {
    const z = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16; // smaller on laptops (base.css)
    const w = strip.clientWidth, k = Math.max(Math.min(phone.matches ? 0.72 : 1, z), w / (X1 - X0));
    strip.style.setProperty("--k", k.toFixed(3));
    const set = (name, px, speed) => strip.style.setProperty(name, `${((w + px * k) / (speed * k)).toFixed(1)}s`);
    set("--t-metro", 330, 70); set("--t-auto", 84, 90); set("--t-seller", 72, 16); set("--t-cloud", 92, 7);
  };
  pace();
  window.addEventListener("resize", pace);

  // sky: dawn 5:30, day 7:30, dusk 17:00, night 19:30 in Bangalore; the sun rises at 6:00 and sets at 18:30
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const preview = new URLSearchParams(location.search).get("sky"); // ?sky=dawn|day|dusk|night to preview
  const phase = () => {
    const [h, mm] = fmt.format(new Date()).split(":").map(Number);
    let mins = h * 60 + mm;
    if (preview) mins = { dawn: 390, day: 720, dusk: 1080, night: 1380 }[preview] ?? mins;
    const sunUp = mins >= 360 && mins < 1110;
    const t = sunUp ? (mins - 360) / 750 : ((mins - 1110 + 1440) % 1440) / 690; // 0 at rise, 1 at set
    strip.dataset.sky = mins < 330 || mins >= 1170 ? "night" : mins < 450 ? "dawn" : mins < 1020 ? "day" : "dusk";
    strip.classList.toggle("is-moon", !sunUp);
    strip.style.setProperty("--orb-x", `${(8 + t * 84).toFixed(1)}%`);
    strip.style.setProperty("--orb-y", (64 + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 84).toFixed(1));
  };
  phase();
  setInterval(phase, 60000);

  // move only while the strip is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => strip.classList.toggle("is-on", e.isIntersecting)).observe(strip);
  } else strip.classList.add("is-on");
})();
