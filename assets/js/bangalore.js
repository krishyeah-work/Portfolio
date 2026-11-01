// bangalore.js — Bangalore above every footer, painted in the manner of Van Gogh. Everything is brushwork: the sky in
// rows of short, thick marks that follow a flow (long waves, whirls, rings round the sun by day or the moon and stars by
// night); buildings, the viaduct, the footpath and the road in marks that follow their surfaces, lit from the upper
// right where the sun and moon hang, with cool shadows on the far sides. Vidhana Soudha with Cubbon Park beside it (lawns
// over low hills, flower beds, a bandstand, a jacaranda; a gopuram standing in the garden), tech-park towers and flats
// with black water tanks; shops along Namma Metro's viaduct and a station; heritage lamps on the footpath.
//
// The people, animals and vehicles are outlined in Prussian blue and painted in brush marks with light and shade, and
// go about their day: the metro brakes into its station, opens its doors and pulls away; a green-and-yellow auto putters
// past; a delivery rider slows and swerves round a Hallikar cow resting on the road; the flower seller pushes her cart
// and stops now and then; a techie walks by on his phone; the coconut seller chops; a dog sleeps. After dark their
// headlamps throw a soft cone and a pool of light on the road ahead.
//
// The pointer paints its own stroke as it moves, nudging the marks it passes aside; a few seconds later the stroke has
// faded into the wind and every mark has flowed back to where it was.
//
// One canvas, painted in three cached layers (the sky, the city behind the metro, the street in front of it); the movers
// are painted once into small images and drawn on top each frame; a stir repaints only the marks it touched. Paints only
// as the footer comes near, moves only while on screen, holds still for reduced motion. Purely decorative (aria-hidden).
// Styles: footer-live.css.

(() => {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  const strip = document.createElement("div");
  strip.className = "blr";
  strip.setAttribute("aria-hidden", "true");
  const view = document.createElement("canvas");
  strip.append(view);
  footer.before(strip);

  const soon = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    soon.disconnect();
    paint();
  }, { rootMargin: "60% 0px" });
  soon.observe(strip);

  async function paint() {
    // ---------- the world, in drawing units (320 tall), centred on Vidhana Soudha ----------
    const H = 320, X0 = 0, X1 = 3400, MID = 1700;
    const SKY = 236;                            // the sky is painted down to here, behind the city
    const FAR = 222, ROW = 234;                 // ground of the skyline (2.4 px/m) and of the row along the viaduct (6 px/m)
    const PARA = 155, DECK = 161, SOFFIT = 172; // top of the viaduct's parapet, its rails, the underside of the deck
    const WALK = 256, KERB = 262;               // where people stand on the footpath (24 px/m); the top of the kerb
    const LANE1 = 291, LANE2 = 316;             // where wheels meet the road: far lane heading right, near lane heading left
    const ORB = [1890, 58];                     // the sun by day, the moon by night
    const STATION = [2000, 2400];               // Namma Metro station on the viaduct
    const COW = 1790;                           // where the cow rests on the road

    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = view.getContext("2d");
    const clock = () => performance.now() / 1000;

    // ---------- seeded randomness and smooth noise, so the painting is the same on every visit ----------
    const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
    let rnd = rng(11);
    const between = (a, b) => a + rnd() * (b - a);
    const pick = (list) => list[Math.floor(rnd() * list.length)];
    const hash = (x, y) => {
      let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const noise = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
    };
    const r1 = (n) => Math.round(n * 10) / 10;

    // ---------- palettes: light is a day painting in teal and cream, dark is The Starry Night ----------
    const mix = (a, b, t) => {
      const p = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)), A = p(a), B = p(b);
      return "#" + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, "0")).join("");
    };
    const PAL = {
      light: {
        night: false,
        shadowC: "#353a78", lightC: "#fff2c8", groundShadow: "rgba(40,34,90,0.32)", // cool violet shade, warm sunlight
        ink: "#2e2723", ink2: "rgba(46,39,35,0.5)", ink3: "rgba(46,39,35,0.26)", shade: "rgba(70,55,110,0.22)", shade2: "#6b5f5a",
        skyTop: "#dcece5", skyLow: "#e8ead8",
        sky: ["#2c7f7b", "#45a299", "#7cc3b5", "#b2ddd0", "#efe4c2", "#dccb9c", "#f7f2e2", "#5c90c9", "#efb63c", "#f5d682", "#fbf3d6", "#7cc3b5", "#b2ddd0"],
        tree: ["#1c3a31", "#2c593d", "#497b3f", "#76a145", "#b3c458", "#dd4e27", "#ee8a2a", "#df699e", "#f1a6c5", "#2a5a57", "#6d4fb0", "#a68ad8", "#f0c63a", "#f6f1e4"],
        road: ["#9a948d", "#aea69a", "#c5baa4", "#d6c89f", "#b49c76", "#a69e92"],
        trailSky: [10, 6, 4, 3], trailRoad: [3, 2, 4],
        crown: "#355f3f", haze: "#d3e3dc",
        far0: "#efe1cc", far1: "#e9d3be", far2: "#d8e3d4", far3: "#dce3ec", far4: "#eddbd7", far5: "#eadcb6",
        stone: "#efe5d0", stone2: "#d6c6a6", stoneHi: "#fbf6ea", glass: "#cde0e6", refl: "rgba(255,255,255,0.85)", litT: "#cde0e6",
        temple: "#efcfa6", temple2: "#e2b37f", t1: "#d6553b", t2: "#3e988a", t3: "#e6b64a", gold: "#e2a83a",
        win: "#55707a", lit: "#55707a", tank: "#2b2b2f", bulb: "#f4ead0",
        shop0: "#f1c7b2", shop1: "#c3e1cb", shop2: "#f4dd9c", shop3: "#c9daf0", shop4: "#e7c9e5",
        sg0: "#cf463a", sg1: "#2f69b3", sg2: "#e5b32e", sg3: "#2c8e58", sg4: "#8d4eb7", sgInk: "#fffaf0", front: "#5d4c45", shut: "#c3c5ca",
        lawn: "#a5c46d", lawn2: "#7ea54f", conc: "#e6e2d8", conc2: "#d2cabb", walk: "#e9dfcb", walk2: "#d3c6ab", walkShade: "#c4b9ab",
        kerbY: "#e7b42b", kerbK: "#2c2b2f", roadBase: "#b7ae9f", lane: "#f3eee0",
        trunk: "#78573f", frond: "#3e7a44", post: "#2b2b30", lantern: "#efe2b4", station: "#f2efe8", stationGlass: "#7fa5b3", purple: "#7d3fc6",
      },
      dark: {
        night: true,
        shadowC: "#04061a", lightC: "#9fb2ea", groundShadow: "rgba(0,0,14,0.5)", // deep blue shade, cool moonlight
        ink: "#090b18", ink2: "rgba(5,6,16,0.55)", ink3: "rgba(5,6,16,0.35)", shade: "rgba(0,0,12,0.3)", shade2: "#141428",
        skyTop: "#141c42", skyLow: "#1c2756",
        sky: ["#182862", "#23428a", "#3560aa", "#6889c6", "#b7cbe7", "#d6cc8c", "#8eaedb", "#2b6a96", "#f0c445", "#f5e19c", "#f7ecc0", "#f3d673", "#f7ecc0"],
        tree: ["#0b1917", "#122824", "#1d3d30", "#284b37", "#3f6140", "#a33e2a", "#c47131", "#a24e7c", "#c480a4", "#16344a", "#3c3170", "#5d4e96", "#a8902e", "#8f96b4"],
        road: ["#18192f", "#222440", "#2b2d4d", "#35375a", "#424364", "#c4a145"],
        trailSky: [10, 9, 4, 6], trailRoad: [3, 4, 2],
        crown: "#10221e", haze: "#1d2650",
        far0: "#272d57", far1: "#2b2a52", far2: "#20304e", far3: "#2d3262", far4: "#302951", far5: "#26314b",
        stone: "#4a4a6e", stone2: "#35354f", stoneHi: "#6b6c92", glass: "#1e2b4e", refl: "rgba(150,180,230,0.35)", litT: "#f2c65a",
        temple: "#4c3c50", temple2: "#3d3046", t1: "#8e4a3e", t2: "#2f6a68", t3: "#a8873a", gold: "#c9973a",
        win: "#191c35", lit: "#f4c95d", tank: "#0f1015", bulb: "#ffd77a",
        shop0: "#3a2f4e", shop1: "#25374a", shop2: "#3d3a45", shop3: "#2a3157", shop4: "#3a2d4f",
        sg0: "#8e3a3a", sg1: "#2c4f86", sg2: "#a8862e", sg3: "#2a6a4a", sg4: "#6a3f8a", sgInk: "#e8e2cf", front: "#e2a94a", shut: "#3b3d52",
        lawn: "#22392b", lawn2: "#2c4a34", conc: "#2f3149", conc2: "#25273d", walk: "#2b2a40", walk2: "#232237", walkShade: "#1c1b2d",
        kerbY: "#9f7e2a", kerbK: "#121216", roadBase: "#1c1d33", lane: "#8f8fa8",
        trunk: "#2b2230", frond: "#1b3a2c", post: "#0e0e14", lantern: "#ffd77a", station: "#3a3d5a", stationGlass: "#f2c65a", purple: "#5a3590",
      },
    };
    // people, animals and vehicles: their own colours by day, mixed towards the night's blue after dark (lights stay lit)
    const FIG = {
      skin: "#a06a45", hair: "#1f1a19", white: "#f4f1e8",
      steel: "#d9dde2", steel2: "#c3c8cf", purple: "#7d3fc6", mglass: "#3b4659", gang: "#2d2f36", mwin: "#3b4659",
      hood: "#f2c230", autoG: "#2f8f55", interior: "#2a2a30", backrest: "#4a3632", seatB: "#232327", capGrey: "#8d9096", meter: "#cfd3d8",
      glassA: "#a9c6d2", grille: "#26282d", amber: "#f0902a", plate: "#f2c230", silver: "#c9ccd2", tyre: "#26262a", hub: "#a9a9a9",
      shirtB: "#d8c6a0", trouser: "#30344a", kurta: "#b8423e", bagB: "#8a5a3a", shoe2: "#3a2f2a",
      black: "#2a2b31", jacket: "#f07a22", helmO: "#ef6f1c", visor: "#262c38", trouserB: "#25262d", bag: "#f08a24", bag2: "#c4600f",
      sari: "#c2367a", border: "#e4b440", blouse: "#2f8a64", mari: "#f39a1f", mari2: "#fbc93c", jas: "#f4f0e2", jas2: "#dfe8c9",
      rose: "#cf3a50", rose2: "#8e1f33", wood: "#a8713e", wood2: "#7f5230", leaf: "#4a9a4a",
      u1: "#d84a3a", u2: "#2f6fc0", u3: "#f1c23a", u4: "#2e9a5e",
      cow: "#efebe1", cow2: "#c9c2b4", horn: "#e8742a", horn2: "#2f6fc0", dog: "#c4874a", dog2: "#9a6634",
      check: "#7aa6d8", pants: "#3a3d46", pack: "#4a4f5a", lanyard: "#d8443a", phone: "#20232a", shoe: "#f0efe9",
      vest: "#f4f1e8", lungi: "#2f7a6a", coco: "#6aa83a", coco2: "#4c8a2a", blade: "#c9ccd2", kite: "#3a2c26", puff: "#9aa0a8",
    };
    const LIT = { lamp: "#fff3c4", tail: "#e0442f", beam: "#ffe08c", screen: "#bfe3ff" };
    let pal, mp;
    const setPalette = () => {
      const night = root.dataset.theme !== "light";
      pal = PAL[night ? "dark" : "light"];
      for (const k of ["sky", "tree", "road"]) pal[k].forEach((v, i) => { pal[k + i] = v; }); // "tree3" names one brush colour
      mp = { ink: night ? "#06071c" : "#26315e", ink2: pal.ink2, ink3: pal.ink3, ...LIT }; // figures are outlined in Prussian blue
      for (const [k, v] of Object.entries(FIG)) mp[k] = night ? mix(v, "#141a3d", 0.42) : v;
      if (night) Object.assign(mp, { mwin: "#ffe29a", screen: "#d6eeff" });
    };
    setPalette();
    const col = (k) => pal[k] ?? k;
    // five tones of a colour: deep shade, shade, itself, lit, full light
    const tones = new Map();
    const tonesOf = (hex, k = 1) => {
      const key = `${hex}${k}${pal.night}`;
      let t = tones.get(key);
      if (!t) tones.set(key, (t = [mix(hex, pal.shadowC, 0.56 * k), mix(hex, pal.shadowC, 0.3 * k), mix(hex, pal.lightC, 0.06 * k), mix(hex, pal.lightC, 0.32 * k), mix(hex, pal.lightC, 0.58 * k),
        mix(hex, pal.shadowC, 0.32 * k)])); // the sixth is the ground a surface is painted on, showing between strokes
      return t;
    };

    // ---------- pen: a drawing is shapes in painting order, each styled "fill|stroke|width" with palette names ----------
    const pen = (x1, y1, x2, y2, j = 0.5) => {
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len, bow = between(-1, 1) * j * Math.min(1, len / 40);
      const ax = x1 + between(-j, j) * 0.4, ay = y1 + between(-j, j) * 0.4, bx = x2 + between(-j, j) * 0.4, by = y2 + between(-j, j) * 0.4;
      return `M${r1(ax)} ${r1(ay)}Q${r1((ax + bx) / 2 - uy * bow)} ${r1((ay + by) / 2 + ux * bow)} ${r1(bx)} ${r1(by)}`;
    };
    const poly = (pts, j = 0.5) => pts.slice(1).map((p, k) => pen(...pts[k], ...p, j)).join("");
    const box = (x, y, w, h) => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`;
    const rbox = (x, y, w, h, q) => `M${r1(x + q)} ${r1(y)}h${r1(w - 2 * q)}q${q} 0 ${q} ${q}v${r1(h - 2 * q)}q0 ${q}-${q} ${q}h${r1(2 * q - w)}q-${q} 0-${q}-${q}v${r1(2 * q - h)}q0-${q} ${q}-${q}z`;
    const oval = (cx, cy, rx, ry) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0z`;
    const outline = (x, y, w, h, j = 0.5) => poly([[x, y + h], [x, y], [x + w, y], [x + w, y + h], [x, y + h]], j);
    let seeds = 1;
    const drawing = () => {
      const list = [];
      const add = (st, d) => { const last = list[list.length - 1]; if (last && last.st === st) last.d += d; else list.push({ st, d }); };
      // a painted surface: its colour, then brush marks over it, clipped to the shape (o: box, dir, len, wid, light, k)
      add.paint = (key, d, o) => list.push({ key, d, o: { seed: seeds++, ...o } });
      add.list = list;
      return add;
    };

    // ---------- painting a surface: marks on a jittered grid, each turned by dir and toned by the light on it ----------
    // the light comes from the upper right, where the sun and the moon are: 0 is deep shade, 1 full light
    const lit = (x0, y0, w, h, k = 1) => (x, y) => 0.55 + k * (0.3 * ((x - x0) / w - 0.5) - 0.3 * ((y - y0) / h - 0.5));
    const orbLit = (cx, cy, rx, ry) => (x, y) => 0.55 + 0.3 * ((x - cx) / rx - (y - cy) / ry);
    const even = (v) => () => v;
    const BOLD = 1.3; // surfaces are painted in marks a little bolder than their sizes say, to match the sky's
    const brushFill = ({ box: [x0, y0, w, h], dir = -Math.PI / 2, len = 5, wid = 2, light = even(0.55), jit = 0.18, seed = 1 }) => {
      const R = rng(seed * 7919 + 13), cell = Math.sqrt(len * BOLD * wid * BOLD) * 0.9, out = [[], [], [], [], []];
      len *= BOLD;
      for (let y = y0 - cell * 0.3; y < y0 + h + cell * 0.5; y += cell * 0.7)
        for (let x = x0 - cell * 0.5 + R() * cell; x < x0 + w + cell * 0.5; x += cell) {
          const px = x + (R() - 0.5) * cell * 0.8, py = y + (R() - 0.5) * cell * 0.5;
          const a = (typeof dir === "function" ? dir(px, py) : dir) + (R() - 0.5) * 2 * jit;
          const v = light(px, py) + (R() - 0.5) * 0.7, t = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.6 ? 2 : v < 0.8 ? 3 : 4;
          const l = len * (0.7 + R() * 0.55), cx = (Math.cos(a) * l) / 2, cy = (Math.sin(a) * l) / 2;
          out[t].push(px - cx, py - cy, px + cx, py + cy);
        }
      return out;
    };
    const strokeFill = (c, dabs, tone, wid) => {
      c.lineWidth = wid;
      for (let t = 0; t < 5; t++) {
        const a = dabs[t];
        if (!a.length) continue;
        c.strokeStyle = tone[t];
        c.beginPath();
        for (let n = 0; n < a.length; n += 4) { c.moveTo(a[n], a[n + 1]); c.lineTo(a[n + 2], a[n + 3]); }
        c.stroke();
      }
    };
    const render = (c, list) => {
      for (const it of list) {
        if (it.key) {
          const [bx, , bw] = it.o.box;
          if (bx > wx1 + 40 || bx + bw < wx0 - 40) continue;
          it.p ||= new Path2D(it.d);
          const tone = tonesOf(col(it.key), it.o.k ?? 1);
          c.fillStyle = tone[5]; c.fill(it.p);
          it.dabs ||= brushFill(it.o);
          c.save(); c.clip(it.p); strokeFill(c, it.dabs, tone, (it.o.wid ?? 2) * BOLD); c.restore();
          continue;
        }
        it.p ||= new Path2D(it.d);
        const [f, s, w] = it.st.split("|");
        if (f) { c.fillStyle = col(f); c.fill(it.p); }
        if (s) { c.strokeStyle = col(s); c.lineWidth = +w || 1; c.stroke(it.p); }
      }
    };

    // ---------- brush that moves: evenly spaced streamlines (Jobard & Lefer), then short thick marks along each one ----------
    const flowLines = function* ({ x0, y0, x1, y1, flow, sep, inside = () => true, step = 1.5, max = 400, every = 6 }) {
      const cols = Math.ceil((x1 - x0) / sep) + 3, rows = Math.ceil((y1 - y0) / sep) + 3, grid = new Array(cols * rows);
      const near = Math.ceil((2 * sep) / step) + 2;
      const free = (x, y, d, id, i) => {
        if (x < x0 || x > x1 || y < y0 || y > y1 || !inside(x, y)) return false;
        const cx = Math.floor((x - x0) / sep) + 1, cy = Math.floor((y - y0) / sep) + 1, d2 = d * d;
        for (let j = cy - 1; j <= cy + 1; j++) for (let k = cx - 1; k <= cx + 1; k++) {
          const g = grid[j * cols + k];
          if (g) for (let n = 0; n < g.length; n += 4) {
            if (g[n + 2] === id && Math.abs(g[n + 3] - i) < near) continue;
            const dx = g[n] - x, dy = g[n + 1] - y;
            if (dx * dx + dy * dy < d2) return false;
          }
        }
        return true;
      };
      const put = (x, y, id, i) => { const k = (Math.floor((y - y0) / sep) + 1) * cols + Math.floor((x - x0) / sep) + 1; (grid[k] ||= []).push(x, y, id, i); };
      const out = [];
      let ids = 0;
      const trace = (sx, sy) => {
        if (!free(sx, sy, sep, -1, 0)) return;
        const id = ids++, halves = [[], []];
        put(sx, sy, id, 0);
        for (const dir of [1, -1]) {
          const pts = halves[dir > 0 ? 0 : 1];
          let x = sx, y = sy;
          for (let n = 1; n <= max; n++) {
            const [ax, ay] = flow(x, y), [bx, by] = flow(x + ax * step * 0.5 * dir, y + ay * step * 0.5 * dir);
            x += bx * step * dir; y += by * step * dir;
            if (!free(x, y, sep * 0.5, id, n * dir)) break;
            put(x, y, id, n * dir);
            pts.push(x, y);
          }
        }
        const [f, b] = halves, line = [];
        for (let n = b.length - 2; n >= 0; n -= 2) line.push(b[n], b[n + 1]);
        line.push(sx, sy);
        for (const v of f) line.push(v);
        if (line.length >= 6) out.push(line);
      };
      const cand = [];
      for (let y = y0 + sep; y < y1; y += sep * every) for (let x = x0 + sep; x < x1; x += sep * every) cand.push([x + between(-sep, sep), y + between(-sep, sep)]);
      for (let k = cand.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [cand[k], cand[j]] = [cand[j], cand[k]]; }
      for (let c = 0, q = 0; ;) {
        while (q < out.length) {
          const l = out[q++];
          for (let n = 0; n + 3 < l.length; n += 8) {
            const x = l[n], y = l[n + 1], dx = l[n + 2] - x, dy = l[n + 3] - y, d = Math.hypot(dx, dy) || 1;
            trace(x - (dy / d) * sep, y + (dx / d) * sep);
            trace(x + (dy / d) * sep, y - (dx / d) * sep);
          }
          yield;
        }
        if (c >= cand.length) break;
        trace(...cand[c++]);
      }
      return out;
    };
    const streams = (o) => { const g = flowLines(o); let r; while (!(r = g.next()).done); return r.value; };
    // the same, giving the browser a turn every 10 ms, so the long pass over the sky never holds up scrolling
    const streamsSoon = async (o) => {
      const g = flowLines(o);
      let r, t = performance.now();
      while (!(r = g.next()).done) if (performance.now() - t > 10) { await new Promise((ok) => setTimeout(ok, 0)); t = performance.now(); }
      return r.value;
    };
    // marks along each streamline: centre, angle, length, bend (how far the middle bows) and a colour from tone()
    const mark = (x, y, a, l, b, c) => ({ x, y, a, ox: x, oy: y, oa: a, l, b, c, dx: 0, dy: 0, da: 0, tx: 0, ty: 0, ta: 0, t: 0 });
    const marks = (lines, { len, gap, tone, out, keep }) => {
      for (const l of lines) {
        const lean = rnd(), acc = [0];
        for (let n = 2; n < l.length; n += 2) acc.push(acc[acc.length - 1] + Math.hypot(l[n] - l[n - 2], l[n + 1] - l[n - 1]));
        const total = acc[acc.length - 1];
        let seg = 0;
        const at = (s) => {
          while (seg < acc.length - 2 && acc[seg + 1] < s) seg++;
          const t = (s - acc[seg]) / (acc[seg + 1] - acc[seg] || 1);
          return [l[seg * 2] + (l[seg * 2 + 2] - l[seg * 2]) * t, l[seg * 2 + 1] + (l[seg * 2 + 3] - l[seg * 2 + 1]) * t];
        };
        for (let s = rnd() * gap; ;) {
          const e = Math.min(s + len * between(0.75, 1.2), total);
          if (e - s < len * 0.5) break;
          const A = at(s), M = at((s + e) / 2), B = at(e);
          const x = (A[0] + B[0]) / 2, y = (A[1] + B[1]) / 2, a = Math.atan2(B[1] - A[1], B[0] - A[0]);
          if (!keep || keep(x, y)) out.push(mark(x, y, a, Math.hypot(B[0] - A[0], B[1] - A[1]), (M[1] - y) * Math.cos(a) - (M[0] - x) * Math.sin(a), tone(x, y, lean)));
          s = e + gap * between(0.6, 1.4);
        }
      }
    };
    const BUCKET = 32;
    const brush = (dabs, colours, width) => {
      const set = { dabs, colours, width, active: new Set(), buckets: new Map() };
      for (const d of dabs) {
        const k = Math.floor(d.ox / BUCKET) * 4096 + Math.floor(d.oy / BUCKET);
        let g = set.buckets.get(k);
        if (!g) set.buckets.set(k, (g = []));
        g.push(d);
      }
      return set;
    };
    const query = (set, x0, y0, x1, y1, fn) => {
      for (let bx = Math.floor((x0 - 16) / BUCKET), bx1 = Math.floor((x1 + 16) / BUCKET); bx <= bx1; bx++)
        for (let by = Math.floor((y0 - 16) / BUCKET), by1 = Math.floor((y1 + 16) / BUCKET); by <= by1; by++) {
          const g = set.buckets.get(bx * 4096 + by);
          if (g) for (const d of g) fn(d);
        }
    };
    const strokeMarks = (c, set, list) => {
      const colours = pal[set.colours], groups = new Map();
      for (const d of list) { let g = groups.get(d.c); if (!g) groups.set(d.c, (g = [])); g.push(d); }
      c.lineWidth = set.width;
      for (const [k, g] of groups) {
        c.strokeStyle = colours[k];
        c.beginPath();
        for (const d of g) {
          const ca = Math.cos(d.a), sa = Math.sin(d.a), hx = (ca * d.l) / 2, hy = (sa * d.l) / 2;
          c.moveTo(d.x - hx, d.y - hy);
          c.quadraticCurveTo(d.x - sa * d.b * 2, d.y + ca * d.b * 2, d.x + hx, d.y + hy);
        }
        c.stroke();
      }
    };

    // ---------- the sky: a wind from the left in long waves, eddying round whirls, rings round the orb and stars ----------
    const whirls = [[260, 92, 44, 1], [560, 52, 50, 1], [860, 118, 34, -1], [1130, 62, 52, 1], [1420, 112, 30, -1], [1560, 40, 38, 1],
      [2240, 44, 54, -1], [2560, 104, 36, 1], [2860, 56, 50, 1], [3180, 100, 42, -1], [1290, 176, 24, 1], [2060, 150, 26, -1], [2700, 168, 22, 1]];
    const stars = [[140, 64], [420, 132], [700, 58], [980, 70], [1010, 150], [1280, 52], [1730, 48], [1640, 104], [2020, 92], [2110, 50],
      [2400, 72], [2420, 160], [2700, 54], [3000, 120], [3060, 52], [3320, 60], [760, 176], [1460, 60]];
    const spinAt = (x, y, cx, cy, R, dir, k, inward, v) => {
      const dx = x - cx, dy = y - cy;
      if (dx > R * 3 || dx < -R * 3 || dy > R * 3 || dy < -R * 3) return;
      const d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 1, f = k * Math.exp(-d2 / (R * R));
      v[0] += ((-dy / d) * dir - (dx / d) * inward) * f;
      v[1] += ((dx / d) * dir - (dy / d) * inward) * f;
    };
    const skyFlow = (x, y) => {
      const v = [1, 0.32 * Math.sin(x / 150 + Math.sin(y / 46) * 1.4) + 0.12 * Math.sin(x / 41 + y / 19)];
      for (const [cx, cy, R, dir] of whirls) spinAt(x, y, cx, cy, R, dir, 4.5, 0.2, v);
      spinAt(x, y, ORB[0], ORB[1], 52, 1, 7, 0, v);
      for (const [sx, sy] of stars) spinAt(x, y, sx, sy, 12, 1, 6, 0, v);
      const n = Math.hypot(v[0], v[1]) || 1;
      return [v[0] / n, v[1] / n];
    };
    const skyTone = (x, y, lean) => {
      const od = Math.hypot(x - ORB[0], y - ORB[1]);
      if (od < 46) { const ring = Math.floor((od - 14) / 4.6); return od < 30 ? (ring % 2 ? 9 : 8) : (ring % 2 ? 10 : 9); }
      for (let k = 0; k < whirls.length; k++) {
        const [cx, cy, R] = whirls[k], d = Math.hypot(x - cx, y - cy);
        if (d < R * 0.85) return [3, 1, 2, 4, 1, 3, 6, 2, 0][(Math.floor(d / 4.6) + k) % 9];
      }
      const cloud = noise(x / 170, y / 52) * 0.75 + noise(x / 50, y / 20) * 0.25 + (y / SKY) * 0.1;
      if (cloud > 0.6) return [4, 5, 6, 4, 6][Math.min(4, Math.floor((lean * 0.6 + noise(x / 30, y / 12) * 0.4) * 5))];
      const t = noise(x / 90 + 30, y / 26) * 0.55 + lean * 0.35 + rnd() * 0.1 + (y / SKY - 0.5) * 0.3;
      return t < 0.26 ? 0 : t < 0.48 ? 1 : t < 0.68 ? 2 : t < 0.87 ? 3 : 7;
    };

    rnd = rng(5);
    const skyDabs = [];
    marks(await streamsSoon({ x0: X0, y0: 2, x1: X1, y1: SKY, flow: skyFlow, sep: 4.6,
      inside: (x, y) => Math.hypot(x - ORB[0], y - ORB[1]) > 14 && whirls.every(([cx, cy]) => Math.abs(x - cx) + Math.abs(y - cy) > 3) && stars.every(([sx, sy]) => Math.hypot(x - sx, y - sy) > 13.5) }),
    { len: 11.5, gap: 2.2, tone: skyTone, out: skyDabs, keep: (x, y) => y > 40 || rnd() < (y - 4) / 40 }); // the top thins out into the page
    // each star wears two rings of broken strokes (by day they're little eddies)
    for (const [sx, sy] of stars) for (const [rr, c] of [[5.8, 11], [10.2, 12]]) {
      const n = Math.round((2 * Math.PI * rr) / 9), span = ((2 * Math.PI) / n) * 0.7, ph = rnd() * 6;
      for (let k = 0; k < n; k++) {
        const am = ph + (k / n) * 2 * Math.PI;
        skyDabs.push(mark(sx + Math.cos(am) * rr, sy + Math.sin(am) * rr, am + Math.PI / 2, 2 * rr * Math.sin(span / 2), -rr * (1 - Math.cos(span / 2)), c));
      }
    }
    const sky = { draw: drawing(), sets: [brush(skyDabs, "sky", 3.3)] };
    sky.draw("skyBase||", box(X0 - 40, -10, X1 - X0 + 80, SKY + 10));
    // the sun or moon sits on top of its rings
    const orbSprite = () => {
      const c = document.createElement("canvas"), z = 4;
      c.width = c.height = 32 * z;
      const g = c.getContext("2d");
      g.scale(z, z);
      g.translate(16, 16);
      if (pal.night) {
        g.fillStyle = "#f3d36b"; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fill();
        g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(5, -3.6, 9.6, 0, 7); g.fill();
      } else {
        g.fillStyle = "#f6c445"; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill();
        g.strokeStyle = "#f9dc84"; g.lineWidth = 2.4; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.stroke();
        g.fillStyle = "#fbe7a8"; g.beginPath(); g.arc(0, 0, 3, 0, 7); g.fill();
      }
      return c;
    };
    let orb;
    sky.over = (c) => { c.drawImage(orb, ORB[0] - 16, ORB[1] - 16, 32, 32); };

    // ---------- the city behind the metro, every surface painted ----------
    rnd = rng(23);
    const back = drawing(), backDabs = [];
    // a hazy row far off, softly painted
    for (let x = X0 - 20; x < X1;) {
      const w = between(30, 70), h = between(24, 76), b = [x, FAR - h, w, h + 4];
      if (x + w < 600 || x > 1442) back.paint("haze", box(...b), { box: b, len: 5, wid: 2.2, k: 0.35, light: lit(...b) });
      x += w + between(0, 10);
    }

    const keep = [[600, 1446], [1446, 1956], [2120, 2350]]; // the garden and the landmarks keep their spot
    const clear = (a, b) => keep.every(([c, d]) => b < c || a > d);
    // flats and offices: a floor every 3 m, windows, black Sintex tanks and now and then a mobile tower. We see the side
    // facing us: the sunlit right side left of the middle, the shaded left side right of it.
    const block = (x, w, floors) => {
      const h = floors * 7 + 4, top = FAR - h, fill = pick(["far0", "far1", "far2", "far3", "far4", "far5"]), b = [x, top, w, h + 3];
      const k = Math.max(-1, Math.min(1, (x + w / 2 - MID) / 900)), sw = Math.abs(k) * 9;
      if (sw > 1.5) {
        const sx = k < 0 ? x + w : x, ex = k < 0 ? sx + sw : sx - sw;
        back.paint(fill, `M${r1(sx)} ${top}L${r1(ex)} ${r1(top + sw * 0.35)}V${FAR + 3}H${r1(sx)}Z`, { box: [Math.min(sx, ex), top, sw, h + 3], len: 5, wid: 2, light: even(k < 0 ? 0.9 : 0.12) });
        back("|ink|0.8", poly([[sx, top], [ex, top + sw * 0.35], [ex, FAR + 3]], 0.3));
      }
      back.paint(fill, box(...b), { box: b, len: 5.5, wid: 2.1, light: lit(...b, 0.6) });
      let win = "", lights = "";
      const n = Math.max(1, Math.round((w - 6) / 7)), step = n > 1 ? (w - 9) / (n - 1) : 0;
      for (let f = 0; f < floors; f++) {
        const y = top + 5 + f * 7;
        for (let j = 0; j < n; j++) { const d = `M${r1(x + 4.5 + j * step)} ${y}v2.6`; if (rnd() < 0.28) lights += d; else win += d; }
      }
      back("|win|2.3", win);
      back("|lit|2.3", lights);
      back("|ink|0.9", outline(x, top, w, h + 3, 0.5));
      for (let t = 0, nt = Math.floor(between(0, 3.4)); t < nt; t++) back("tank|ink|0.6", rbox(x + 3 + between(0, w - 9), top - 3.6, 3.2, 3.6, 1.2));
      if (rnd() < 0.06) { const mx = x + w / 2; back("|ink|0.9", `M${r1(mx - 3)} ${top}L${r1(mx)} ${top - 30}L${r1(mx + 3)} ${top}M${r1(mx - 2.2)} ${top - 8}L${r1(mx + 1.6)} ${top - 18}M${r1(mx + 2.2)} ${top - 8}L${r1(mx - 1.6)} ${top - 18}`); }
    };
    for (let x = X0 - 24; x < X1;) {
      const w = between(34, 76);
      if (clear(x, x + w)) block(x, w, rnd() < 0.18 ? Math.round(between(12, 18)) : Math.round(between(4, 10)));
      x += w + between(8, 30); // room between them, for the far trees
    }

    // Vidhana Soudha (2.4 px/m): granite block with three floors of windows, domed corner pavilions, a 12-column portico
    // on its grand stair, and the central tower and dome with the lion emblem 46 m up
    const L = 1452, R = 1948, top = 176, meridian = (ax, ay) => (x, y) => Math.atan2(ay - y, ax - x);
    back.paint("stone", box(L, top, R - L, FAR - top + 3), { box: [L, top, R - L, FAR - top + 3], len: 5, wid: 2.1, light: lit(L, top, R - L, FAR - top, 0.5) });
    let sh = "";
    for (let x = L + 4; x < R; x += 31) sh += `M${x} ${top + 4}v${FAR - top - 6}`;
    back("|shade|2.2", sh);
    for (const y of [184, 194, 204]) {
      let w = "", l = "";
      for (let x = L + 9; x < R - 6; x += 7.4) { if (x > 1632 && x < 1768) continue; const d = `M${r1(x)} ${y}v3.4`; if (rnd() < 0.22) l += d; else w += d; }
      back("|win|2.2", w); back("|lit|2.2", l);
    }
    back("|stoneHi|1.6", pen(L, top + 1.6, R, top + 1.6, 0.3));
    back("|ink|1", outline(L, top, R - L, FAR - top + 3, 0.4) + pen(L - 3, top + 3, R + 3, top + 3, 0.3) + pen(L, FAR - 5, R, FAR - 5, 0.3));
    for (const px of [L - 4, R - 46]) {
      const c = px + 25, dome = `M${c - 14} 160Q${c - 14} 145 ${c} 142Q${c + 14} 145 ${c + 14} 160Z`;
      back.paint("stone", box(px, 160, 50, 17), { box: [px, 160, 50, 17], len: 4.5, wid: 2, light: lit(px, 160, 50, 17, 0.6) });
      back("|ink|1", outline(px, 160, 50, 17, 0.3) + pen(px - 2, 163, px + 52, 163, 0.2));
      for (let k = 0; k < 3; k++) back("shade2|ink|0.6", `M${px + 11 + k * 12} 177v-7a3 3 0 0 1 6 0v7z`);
      back.paint("stone", dome, { box: [c - 14, 142, 28, 18], len: 4, wid: 1.8, dir: meridian(c, 141), light: orbLit(c, 152, 14, 10) });
      back("|ink|1", dome + `M${c} 142v-5`);
      back("gold||", `M${c - 1.6} 137h3.2l-1.6-4z`);
    }
    const stair = `M1626 ${FAR + 2}L1646 204H1754L1774 ${FAR + 2}Z`;
    back.paint("stone2", stair, { box: [1626, 204, 148, FAR + 2 - 204], dir: 0, len: 6, wid: 1.8, light: lit(1626, 204, 148, 18, 0.7) });
    let steps = "";
    for (let s = 0; s < 7; s++) steps += pen(1630 + s * 2.6, FAR - s * 2.6, 1770 - s * 2.6, FAR - s * 2.6, 0.2);
    back("|ink3|0.7", steps);
    back("|ink|0.9", poly([[1626, FAR + 2], [1646, 204], [1754, 204], [1774, FAR + 2]], 0.3));
    back.paint("stone", "M1644 158L1656 150H1744L1756 158Z" + box(1644, 158, 112, 46), { box: [1644, 150, 112, 54], len: 4.5, wid: 2, light: lit(1644, 150, 112, 54, 0.5) });
    back.paint("shade2", box(1650, 171, 100, 33), { box: [1650, 171, 100, 33], len: 4, wid: 2, k: 0.5, light: even(0.35) });
    let colsLit = "", colsShade = "", cols = "";
    for (let k = 0; k < 12; k++) {
      const x = 1652.4 + k * 8.6;
      back("stone||", box(x, 171, 3.4, 33));
      colsLit += `M${r1(x + 2.6)} 172.6V203`; colsShade += `M${r1(x + 0.8)} 172.6V203`; cols += `M${r1(x)} 204V171M${r1(x + 3.4)} 204V171`;
    }
    back("|stoneHi|1.1", colsLit); back("|shade|1.1", colsShade); back("|ink2|0.7", cols);
    back("|ink|1", outline(1644, 158, 112, 46, 0.3) + pen(1640, 171, 1760, 171, 0.3) + poly([[1644, 158], [1656, 150], [1744, 150], [1756, 158]], 0.3));
    back.paint("stone", box(1666, 126, 68, 25), { box: [1666, 126, 68, 25], len: 4, wid: 1.9, light: lit(1666, 126, 68, 25, 0.6) });
    for (const x of [1676, 1695.5, 1715]) back("shade2||", `M${x} 150v-12a4.5 4.5 0 0 1 9 0v12z`);
    back("|ink|1", outline(1666, 126, 68, 25, 0.3));
    back.paint("stone", box(1672, 120, 56, 6), { box: [1672, 120, 56, 6], dir: 0, len: 5, wid: 1.6, light: even(0.72) });
    back("|ink|0.9", outline(1672, 120, 56, 6, 0.2));
    const DOME = "M1672 120C1672 101 1686 90 1700 90C1714 90 1728 101 1728 120Z";
    back.paint("stone", DOME, { box: [1672, 90, 56, 30], len: 5, wid: 2, dir: meridian(1700, 88), light: orbLit(1700, 108, 28, 18) });
    back("|ink|1.1", DOME);
    back("|ink2|0.8", "M1686 120Q1688 100 1700 90M1714 120Q1712 100 1700 90");
    back("gold|ink|0.6", "M1698 90v-5h4v5zM1695 85q5-3.6 10 0zM1697.6 82v-4q2.4-2 4.8 0v4z");

    // a Dravidian gopuram: stone base with its doorway, six painted tiers full of figures, a barrel-vault top with kalasas
    const gopuram = (c) => {
      const gb = [c - 33, FAR - 26, 66, 29];
      back.paint("temple", box(...gb), { box: gb, len: 4.5, wid: 2, light: lit(...gb, 0.7) });
      back("shade2||", `M${c - 7} ${FAR + 3}v-17a7 7 0 0 1 14 0v17z`);
      back("|ink|1", outline(...gb, 0.3));
      for (let t = 0; t < 6; t++) {
        const y1 = FAR - 26 - t * 10, y0 = y1 - 10, w1 = 62 - t * 7.4, w0 = w1 - 7.4;
        const tier = `M${r1(c - w1 / 2)} ${y1}L${r1(c - w0 / 2)} ${y0}H${r1(c + w0 / 2)}L${r1(c + w1 / 2)} ${y1}Z`;
        back.paint(t % 2 ? "temple2" : "temple", tier, { box: [c - w1 / 2, y0, w1, 10], dir: 0, len: 4, wid: 1.8, light: lit(c - w1 / 2, y0, w1, 10, 0.9) });
        const fig = { t1: "", t2: "", t3: "" };
        for (let x = c - w0 / 2 + 3; x < c + w0 / 2 - 2; x += 4) fig[pick(["t1", "t2", "t3"])] += `M${r1(x)} ${y1 - 2.6}v-4.2`;
        for (const k in fig) back(`|${k}|1.9`, fig[k]);
        back("|ink|0.9", pen(c - w1 / 2 - 2, y1, c + w1 / 2 + 2, y1, 0.3) + pen(c - w1 / 2, y1, c - w0 / 2, y0, 0.3) + pen(c + w1 / 2, y1, c + w0 / 2, y0, 0.3));
      }
      const vt = FAR - 86, vault = `M${c - 17} ${vt}v-7q0-5 5-5h24q5 0 5 5v7z`;
      back.paint("temple", vault, { box: [c - 17, vt - 12, 34, 12], dir: 0, len: 4, wid: 1.8, light: lit(c - 17, vt - 12, 34, 12, 0.9) });
      back("|ink|1", vault);
      for (let k = -2; k <= 2; k++) back("gold|ink|0.5", `M${r1(c + k * 6.5 - 1.4)} ${vt - 12}h2.8l-1.4-5z`);
    };

    // glass tech-park towers: painted glass, mullions and floors, streaks of reflection, lit floors at night
    const tower = (x, w, h, crownTop) => {
      const t = FAR - h, tb = [x, t, w, h + 3];
      back.paint("glass", box(...tb), { box: tb, len: 7, wid: 2.2, k: 0.8, light: lit(...tb, 0.7) });
      let grid = "", refl = "", lights = "";
      for (let mx = x + 7; mx < x + w - 2; mx += 7) grid += `M${mx} ${t + 1}V${FAR}`;
      for (let fy = t + 9; fy < FAR; fy += 9) grid += `M${x} ${fy}h${w}`;
      for (let k = 0; k < h / 5; k++) { const rx = x + 3 + rnd() * (w - 12), ry = t + 5 + rnd() * (h - 12); refl += `M${r1(rx)} ${r1(ry)}l${r1(between(5, 9))} ${r1(-between(4, 7))}`; }
      for (let fy = t + 9; fy < FAR - 4; fy += 9) if (rnd() < 0.4) lights += `M${x + 2.5 + Math.floor(rnd() * (w / 7 - 1)) * 7} ${fy + 4.5}h4`;
      back("|ink3|0.6", grid);
      back("|refl|2.2", refl);
      back("|litT|2.8", lights);
      back("|ink|1", outline(x, t, w, h + 3, 0.5));
      if (crownTop) back("|ink|1", `M${x + 6} ${t}v-10h${w - 12}v10M${x + w / 2} ${t - 10}v-16`);
    };
    tower(2134, 64, 128, false);
    tower(2282, 54, 150, true);

    // far trees: the Garden City between the blocks
    for (let k = 0; k < 46; k++) {
      const x = between(X0, X1), y = FAR - between(3, 8);
      if (!clear(x - 10, x + 10)) continue;
      let d = "";
      for (let m = 0; m < 8; m++) { const a = between(-2.4, -0.7); const px = x + between(-9, 9), py = y + between(-5, 4); d += `M${r1(px)} ${r1(py)}l${r1(Math.cos(a) * 4)} ${r1(Math.sin(a) * 4)}`; }
      back(`|tree${pick([1, 2, 3])}|2.4`, d);
    }

    // the row along the viaduct (6 px/m): two- and three-storey shops with painted signboards, rolling shutters and tanks
    const shopRows = [[X0 - 20, 560], [2010, 2830], [2880, X1 + 20]];
    const shop = (x, w) => {
      const floors = rnd() < 0.55 ? 2 : 3, t = ROW - floors * 18 - 3, fb = [x, t, w, ROW - t + 2];
      back.paint(pick(["shop0", "shop1", "shop2", "shop3", "shop4"]), box(...fb), { box: fb, len: 5, wid: 2.2, light: lit(...fb, 0.6) });
      for (let f = 1; f < floors; f++) {
        const fy = ROW - (f + 1) * 18;
        for (let wx = x + 5; wx + 9 < x + w - 3; wx += 14) { back("shade2||", box(wx, fy + 6, 8, 8)); back("|ink2|0.8", pen(wx - 2, fy + 5, wx + 10, fy + 5, 0.3)); }
      }
      const gy = ROW - 18, sg = [x + 2, gy + 1, w - 4, 6.4];
      back.paint(pick(["sg0", "sg1", "sg2", "sg3", "sg4"]), box(...sg), { box: sg, dir: 0, len: 5, wid: 1.6, light: even(0.6) });
      back("|ink|0.6", box(...sg));
      let tx = `M${r1(x + 5.5)} ${gy + 5.8}`;
      for (let k = 0, n = Math.floor((w - 12) / 4); k < n; k++) tx += rnd() < 0.3 ? "a1.2 1.2 0 1 1 1.8-.9m1.6.9" : "q0-3 1.4-3t1.4 1.6m1.2 1.4";
      back("|sgInk|0.7", tx);
      const fr = [x + 4, gy + 9, w - 8, ROW - gy - 9];
      back.paint("front", box(...fr), { box: fr, dir: 0, len: 4, wid: 1.8, k: 0.6, light: lit(...fr, 0.5) });
      back("|ink|0.6", box(...fr));
      back("shut|ink|0.5", box(x + 4, gy + 9, w - 8, between(2.6, 5.4)));
      back("|ink|1", outline(...fb, 0.5) + pen(x - 2, t + 3, x + w + 2, t + 3, 0.3));
      if (rnd() < 0.7) back("tank|ink|0.6", rbox(x + between(4, w - 10), t - 6, 5.4, 6, 2));
      if (rnd() < 0.35) {
        const bx = rnd() < 0.5 ? x + 3 : x + w - 3; let d = "";
        for (let k = 0; k < 9; k++) { const a = between(0, Math.PI * 2); const px = bx + between(-4, 4), py = t + 6 + between(0, 14); d += `M${r1(px)} ${r1(py)}l${r1(Math.cos(a) * 2.6)} ${r1(Math.sin(a) * 2.6)}`; }
        back("|tree7|2.4", d);
      }
    };
    for (const [a, b] of shopRows) for (let x = a; x < b - 24;) { const w = Math.min(between(28, 48), b - x); shop(x, w); x += w + (rnd() < 0.25 ? between(4, 12) : 0); }
    // Vidhana Soudha's lawn and its railing
    back.paint("lawn", box(1440, FAR - 1, 570, ROW - FAR + 3), { box: [1440, FAR - 1, 570, ROW - FAR + 3], len: 4, wid: 2, jit: 0.5, light: (x, y) => 0.32 + noise(x / 30, y / 4) * 0.5 });
    let grass = "";
    for (let x = 1442; x < 2008; x += between(2.2, 3.6)) grass += `M${r1(x)} ${r1(ROW - between(0, 8))}l${r1(between(-1, 1.6))} -3`;
    back("|lawn2|1.8", grass);
    let rail = "";
    for (let x = 1442; x < 2008; x += 3.2) if (x < 1622 || x > 1778) rail += `M${r1(x)} ${ROW}v-6`;
    back("|ink2|0.6", rail + pen(1442, ROW - 6, 1622, ROW - 6, 0.2) + pen(1778, ROW - 6, 2008, ROW - 6, 0.2));

    // trees: a filled crown with brush marks that follow the way the tree grows, lit from the upper right
    const treeTone = (cx, cy, rx, ry, bloom, share) => (x, y) => {
      if (bloom !== undefined && rnd() < share) return rnd() < 0.6 ? bloom : bloom + 1;
      const v = ((x - cx) / rx) * 0.45 - ((y - cy) / ry) * 0.6 + noise(x / 9, y / 9) * 0.5 + rnd() * 0.4;
      return v < 0.2 ? 0 : v < 0.45 ? 1 : v < 0.7 ? 2 : v < 0.95 ? 3 : 4;
    };
    const blob = (cx, cy, rx, ry, flat) => {
      const ph = rnd() * 6, ph2 = rnd() * 6, rad = (t) => 1 + 0.12 * Math.sin(3 * t + ph) + 0.07 * Math.sin(5 * t + ph2);
      let d = "";
      for (let k = 0; k <= 48; k++) {
        const t = (k / 48) * 2 * Math.PI, q = rad(t);
        d += `${k ? "L" : "M"}${r1(cx + Math.cos(t) * rx * q)} ${r1(Math.min(cy + ry * flat, cy + Math.sin(t) * ry * q))}`;
      }
      return { d: d + "Z", inside: (x, y) => { if (y > cy + ry * flat - 1) return false; const dx = (x - cx) / rx, dy = (y - cy) / ry; return Math.hypot(dx, dy) < rad(Math.atan2(dy, dx)) * 0.96; } };
    };
    // strokes fan out from below the crown and droop at its edges
    const fan = (cx, ox, oy, rx, droop) => (x, y) => {
      const dx = x - ox, dy = y - oy, d = Math.hypot(dx, dy) || 1, c = (droop * (x - cx)) / rx;
      const vx = dx / d - (dy / d) * c, vy = dy / d + (dx / d) * c, n = Math.hypot(vx, vy) || 1;
      return [vx / n, vy / n];
    };
    const crown = (dr, out, cx, cy, rx, ry, flat, flow, tone, o = {}) => {
      const b = blob(cx, cy, rx, ry, flat), inside = o.skip ? (x, y) => b.inside(x, y) && o.skip(x, y) : b.inside;
      dr(`crown|${o.ink ?? "ink|0.9"}`, b.d);
      marks(streams({ x0: cx - rx * 1.3, y0: cy - ry * 1.3, x1: cx + rx * 1.3, y1: cy + ry * 1.3, flow, sep: 3.9, inside, step: 1.2, max: 60, every: 3 }), { len: o.len ?? 8.5, gap: 1.6, tone, out });
    };
    const trunk = (dr, x, g, t, wb, wt) => {
      const d = `M${r1(x - wb)} ${g}Q${r1(x - wt * 1.2)} ${r1((g + t) / 2)} ${r1(x - wt)} ${r1(t)}h${r1(wt * 2)}Q${r1(x + wt * 1.2)} ${r1((g + t) / 2)} ${r1(x + wb)} ${g}Z`;
      dr.paint("trunk", d, { box: [x - wb, t, wb * 2, g - t], len: 4, wid: 1.5, jit: 0.1, light: lit(x - wb, t, wb * 2, g - t, 1.4) });
      dr("|ink|0.8", d);
    };
    const tree = {
      // rain tree: a wide umbrella of a crown on spreading branches
      rain(dr, out, x, g, s) {
        const cy = g - 92 * s;
        trunk(dr, x, g, g - 40 * s, 4 * s, 2.4 * s);
        let br = "";
        for (const [dx, dy] of [[-56, 8], [-30, 2], [4, -6], [32, 2], [58, 10]]) br += `M${r1(x)} ${r1(g - 38 * s)}Q${r1(x + dx * 0.35 * s)} ${r1(cy + 26 * s)} ${r1(x + dx * s)} ${r1(cy + (12 + dy) * s)}`;
        dr("|trunk|2.4", br);
        crown(dr, out, x, cy, 76 * s, 30 * s, 0.55, fan(x, x, cy + 46 * s, 76 * s, 0.4), treeTone(x, cy, 76 * s, 30 * s));
      },
      // gulmohar in flame: a broad flat-topped crown, half red-orange
      flame(dr, out, x, g, s) {
        const cy = g - 70 * s;
        trunk(dr, x, g, cy + 10 * s, 3 * s, 1.8 * s);
        crown(dr, out, x, cy, 44 * s, 18 * s, 0.6, fan(x, x, cy + 30 * s, 44 * s, 0.45), treeTone(x, cy, 44 * s, 18 * s, 5, 0.55));
      },
      // pink trumpet tree (tabebuia): a round crown thick with pink
      pink(dr, out, x, g, s) {
        const cy = g - 74 * s;
        trunk(dr, x, g, cy + 14 * s, 2.8 * s, 1.6 * s);
        crown(dr, out, x, cy, 32 * s, 26 * s, 0.75, fan(x, x, cy + 30 * s, 32 * s, 0.3), treeTone(x, cy, 32 * s, 26 * s, 7, 0.62));
      },
      // jacaranda in bloom: a loose round crown, mostly lilac
      jac(dr, out, x, g, s) {
        const cy = g - 78 * s;
        trunk(dr, x, g, cy + 16 * s, 3 * s, 1.8 * s);
        crown(dr, out, x, cy, 38 * s, 26 * s, 0.7, fan(x, x, cy + 34 * s, 38 * s, 0.35), treeTone(x, cy, 38 * s, 26 * s, 10, 0.68));
      },
      // mast tree (false ashoka): Bangalore's answer to Van Gogh's cypress, a tall flame of drooping leaves
      mast(dr, out, x, g, s) {
        const h = 150 * s, w = 30 * s, t = g - h, lean = between(-4, 4) * s;
        const lx = (y) => x + lean * ((g - y) / h) ** 2;
        const half = (y) => { const u = (y - t) / h; return u < 0 || u > 0.94 ? 0 : (w / 2) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.7) * (0.86 + 0.14 * Math.sin(y / 6)); };
        trunk(dr, x, g, g - 14 * s, 2.2 * s, 1.6 * s);
        let d = "";
        for (let y = g - h * 0.06; y >= t; y -= 3) d += `${d ? "L" : "M"}${r1(lx(y) - half(y))} ${r1(y)}`;
        for (let y = t; y <= g - h * 0.06; y += 3) d += `L${r1(lx(y) + half(y))} ${r1(y)}`;
        dr("crown|ink|0.9", d + "Z");
        const flow = (px, py) => { const vx = 0.5 * Math.sin((py + px * 0.6) / 8) + ((px - lx(py)) / w) * 0.5, n = Math.hypot(vx, 1); return [vx / n, -1 / n]; };
        marks(streams({ x0: x - w, y0: t - 2, x1: x + w, y1: g, flow, sep: 3.6, inside: (px, py) => Math.abs(px - lx(py)) < half(py) * 0.92, step: 1.2, max: 50, every: 3 }),
          { len: 9, gap: 1.4, tone: treeTone(x, (t + g) / 2, w / 2, h / 2), out });
      },
      // coconut palm: a leaning ringed trunk and drooping fronds
      palm(dr, out, x, g, s) {
        const lean = between(-12, 12) * s, tx = x + lean, ty = g - 100 * s, my = g - 55 * s;
        dr("|trunk|3.2", `M${r1(x)} ${g}Q${r1(x + lean * 0.1)} ${r1(my)} ${r1(tx)} ${r1(ty)}`);
        dr("|ink2|1", `M${r1(x + 1.4)} ${g}Q${r1(x + lean * 0.1 + 1.4)} ${r1(my)} ${r1(tx + 1)} ${r1(ty)}`);
        let rings = "";
        for (let t = 0.08; t < 0.95; t += 0.07) rings += `M${r1(x + 0.2 * lean * t * (1 - t) + lean * t * t - 1.6)} ${r1(g + 2 * (my - g) * t * (1 - t) + (ty - g) * t * t)}h3.2`;
        dr("|ink2|0.7", rings);
        for (let k = 0; k < 9; k++) {
          const a = -Math.PI / 2 + (k - 4) * 0.42 + between(-0.1, 0.1), Lf = between(22, 28) * s, droop = Math.abs(k - 4) * 3 * s + 4 * s;
          const ex = tx + Math.cos(a) * Lf, ey = ty + Math.sin(a) * Lf + droop, qx = tx + Math.cos(a) * Lf * 0.6, qy = ty + Math.sin(a) * Lf * 0.6 - 3 * s;
          let f = `M${r1(tx)} ${r1(ty)}Q${r1(qx)} ${r1(qy)} ${r1(ex)} ${r1(ey)}`;
          for (let t = 0.22; t < 0.96; t += 0.12) {
            const bx = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * qx + t * t * ex, by = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * qy + t * t * ey;
            const ang = Math.atan2(2 * (1 - t) * (qy - ty) + 2 * t * (ey - qy), 2 * (1 - t) * (qx - tx) + 2 * t * (ex - qx)), l = 6 * s * (1 - t * 0.45);
            for (const side of [-1, 1]) f += `M${r1(bx)} ${r1(by)}l${r1(Math.cos(ang + side * 0.8 + 0.35) * l)} ${r1(Math.sin(ang + side * 0.8 + 0.35) * l + 1.4 * s)}`;
          }
          dr(k > 4 ? "|tree3|1.6" : "|frond|1.6", f);
        }
        dr("wood2|ink|0.5", `M${r1(tx - 2.4)} ${r1(ty + 3)}a1.8 1.8 0 1 0 .1 0M${r1(tx + 1.6)} ${r1(ty + 3.6)}a1.8 1.8 0 1 0 .1 0`);
      },
    };
    // Cubbon Park beside Vidhana Soudha: lawns rolling over low hills, flower beds and clipped bushes, a path up to the
    // bandstand, the park's trees behind and a hedge along the road; the gopuram stands in the garden
    const G0 = 600, G1 = 1442, GOP = 1182, BAND = 1342;
    const bump = (x, c, h, w) => h * Math.exp(-(((x - c) / w) ** 2));
    const crest = (x) => FAR + 3 - (bump(x, 690, 10, 80) + bump(x, 890, 20, 200) + bump(x, BAND, 15, 110)) * (1 - Math.exp(-(((x - GOP) / 46) ** 2))) - noise(x / 40, 3) * 2;
    const slope = (x) => (crest(x + 2) - crest(x - 2)) / 4;
    const bandY = crest(BAND) + 1;
    const clearOf = (x, y) => !(Math.abs(x - GOP) < 35 && y < FAR + 4) && !(Math.abs(x - BAND) < 23 && y < bandY + 1 && y > bandY - 34);
    rnd = rng(29);
    // a soft line of trees far beyond the park, then the park's own far trees, showing over the hills
    let treeline = `M${G0} ${ROW}`;
    for (let x = G0; x <= G1; x += 6) treeline += `L${x} ${r1(FAR - 16 - noise(x / 26, 7) * 9)}`;
    back.paint("haze", treeline + `L${G1} ${ROW}Z`, { box: [G0, FAR - 26, G1 - G0, ROW - FAR + 26], len: 4, wid: 2, k: 0.5, light: (x, y) => 0.35 + noise(x / 20, y / 8) * 0.4 });
    back("|ink3|0.6", treeline.replace(`M${G0} ${ROW}L`, "M"));
    for (let x = G0 + 12; x < G1 - 8; x += between(20, 34)) {
      const rx = between(15, 24), ry = between(10, 14), cy = FAR - between(8, 15), tone = treeTone(x, cy, rx, ry);
      crown(back, backDabs, x, cy, rx, ry, 0.9, fan(x, x, cy + ry * 2.4, rx, 0.3), (px, py) => { const t = tone(px, py); return t < 2 && rnd() < 0.55 ? 9 : Math.min(3, t); },
        { ink: "ink3|0.6", len: 7, skip: (px, py) => py < crest(px) - 1 && clearOf(px, py) });
    }
    // the hills, the sunny slopes facing the light
    let hill = `M${G0} ${ROW + 3}`;
    for (let x = G0; x <= G1; x += 4) hill += `L${x} ${r1(crest(x))}`;
    hill += `L${G1} ${ROW + 3}Z`;
    back.paint("lawn", hill, { box: [G0, FAR - 30, G1 - G0, ROW + 3 - FAR + 30], len: 4, wid: 2, jit: 0.4, light: (x, y) => 0.45 + slope(x) * 4 + noise(x / 30, y / 6) * 0.3 });
    // flower beds (cannas, marigolds, pinks, lilies) on the slopes, clipped bushes, the path up to the bandstand
    const probe = document.createElement("canvas").getContext("2d");
    const beds = [[652, 8, 16, [12, 5]], [762, 0, 24, [5, 6]], [884, 9, 28, [12, 6]], [1002, 0, 22, [7, 8]], [1076, 7, 13, [13, 7]], [1296, 0, 15, [5, 12]], [1404, 9, 15, [7, 10]]]
      .map(([x, d, rx, colours]) => { const y = d ? crest(x) + d : ROW - 9, ry = 2.6 + rx * 0.04; return { x, y, rx, ry, colours, p: new Path2D(oval(x, y, rx, ry)) }; });
    for (const b of beds) {
      back.paint("crown", oval(b.x, b.y, b.rx + 1.2, b.ry + 1), { box: [b.x - b.rx - 1.2, b.y - b.ry - 1, 2 * b.rx + 2.4, 2 * b.ry + 2], dir: 0, len: 3, wid: 1.6, k: 0.6, light: even(0.35) });
      for (let k = 0, n = Math.round(b.rx * 2.2); k < n; k++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), x = b.x + Math.cos(a) * r * b.rx * 0.92, y = b.y + Math.sin(a) * r * b.ry * 0.85;
        backDabs.push(mark(x, y, between(-0.5, 0.5) + (rnd() < 0.5 ? 0 : Math.PI / 2), between(2.2, 3.4), 0, rnd() < 0.18 ? 1 : pick(b.colours)));
      }
    }
    const bushes = [710, 826, 948, 1034, 1124, 1236, 1388, 1430].map((x) => { const r = between(5, 8); return { x, y: crest(x) + between(5, 11), r }; });
    for (const b of bushes) crown(back, backDabs, b.x, b.y, b.r * 1.15, b.r * 0.9, 0.75, fan(b.x, b.x, b.y + b.r * 2, b.r, 0.2), treeTone(b.x, b.y, b.r, b.r), { ink: "ink2|0.6", len: 5 });
    const lefts = [], rights = [];
    for (let k = 0; k <= 16; k++) {
      const u = k / 16, v = 1 - u, x = v * v * 1262 + 2 * u * v * 1316 + u * u * 1336, y = v * v * (ROW + 3) + 2 * u * v * (ROW - 7) + u * u * (bandY + 1), hw = 6 - 3.6 * u;
      lefts.push(`${r1(x - hw)} ${r1(y)}`); rights.unshift(`${r1(x + hw)} ${r1(y)}`);
    }
    const walkway = `M${lefts.join("L")}L${rights.join("L")}Z`, walkP = new Path2D(walkway);
    back.paint("walk", walkway, { box: [1254, bandY, 92, ROW + 3 - bandY], dir: -0.75, len: 4, wid: 1.8, light: lit(1254, bandY, 92, ROW + 3 - bandY, 0.6) });
    back("|ink2|0.6", `M${lefts.join("L")}M${rights.join("L")}`);
    // the grass, in rows that follow the lie of the land
    const flowHill = (x, y) => { const c = crest(x), k = Math.max(0, Math.min(1, (ROW + 3 - y) / (ROW + 3 - c))), vy = slope(x) * k + 0.06 * Math.sin(x / 23 + y / 5), n = Math.hypot(1, vy); return [1 / n, vy / n]; };
    const onLawn = (x, y) => y > crest(x) + 1 && y < ROW - 5.5 && clearOf(x, y) && !probe.isPointInPath(walkP, x, y) && !beds.some((b) => probe.isPointInPath(b.p, x, y))
      && !bushes.some((b) => Math.hypot((x - b.x) / (b.r * 1.2), (y - b.y) / (b.r * 0.95)) < 1);
    marks(streams({ x0: G0, y0: FAR - 26, x1: G1, y1: ROW - 5, flow: flowHill, sep: 3.6, inside: onLawn, step: 1.5, max: 200, every: 5 }), {
      len: 8, gap: 1.8, out: backDabs,
      tone: (x, y, lean) => { const v = 0.24 + slope(x) * 5 + noise(x / 40, y / 7) * 0.35 + lean * 0.2; return v < 0.28 ? 1 : v < 0.5 ? 2 : v < 0.76 ? 3 : 4; },
    });
    // the bandstand: a platform, slim columns and a railing, a copper-green dome; strung with bulbs, lit after dark
    back.paint("stone", box(BAND - 20, bandY - 4, 40, 5), { box: [BAND - 20, bandY - 4, 40, 5], dir: 0, len: 4, wid: 1.6, light: lit(BAND - 20, bandY - 4, 40, 5, 0.6) });
    back("shade2||", box(BAND - 17, bandY - 18, 34, 14));
    let pillars = "", pillarsLit = "", bars = "", bulbs = "";
    for (const k of [-16, -8, 0, 8, 16]) { pillars += box(BAND + k - 0.8, bandY - 18, 1.6, 14); pillarsLit += `M${BAND + k + 0.4} ${r1(bandY - 17.4)}v13`; }
    for (let x = BAND - 16; x <= BAND + 16; x += 2) bars += `M${x} ${r1(bandY - 8.6)}v4.4`;
    for (let x = BAND - 20; x <= BAND + 20; x += 4) bulbs += `M${x} ${r1(bandY - 18.4)}h.1`;
    back("stoneHi|ink2|0.5", pillars); back("|stoneHi|0.6", pillarsLit); back("|ink3|0.5", bars);
    back("|ink2|0.6", pen(BAND - 17, bandY - 8.6, BAND + 17, bandY - 8.6, 0.2));
    back.paint("stone", box(BAND - 22, bandY - 20.6, 44, 2.8), { box: [BAND - 22, bandY - 20.6, 44, 2.8], dir: 0, len: 4, wid: 1.4, light: even(0.75) });
    const bdome = `M${BAND - 20} ${r1(bandY - 20.6)}Q${BAND - 19} ${r1(bandY - 27)} ${BAND - 6} ${r1(bandY - 29.6)}Q${BAND} ${r1(bandY - 31)} ${BAND} ${r1(bandY - 33)}Q${BAND} ${r1(bandY - 31)} ${BAND + 6} ${r1(bandY - 29.6)}Q${BAND + 19} ${r1(bandY - 27)} ${BAND + 20} ${r1(bandY - 20.6)}Z`;
    back.paint("t2", bdome, { box: [BAND - 20, bandY - 33, 40, 12.4], dir: meridian(BAND, bandY - 34), len: 4, wid: 1.8, light: orbLit(BAND, bandY - 25, 20, 6) });
    back("|ink|0.9", outline(BAND - 20, bandY - 4, 40, 5, 0.3) + pen(BAND - 22, bandY - 20.6, BAND + 22, bandY - 20.6, 0.2) + pen(BAND - 22, bandY - 17.8, BAND + 22, bandY - 17.8, 0.2) + bdome);
    back("gold|ink|0.5", `M${BAND - 1.2} ${r1(bandY - 33)}h2.4l-1.2-4z`);
    back("|bulb|1.7", bulbs);
    // a clipped hedge along the road, with stone gateposts where the path comes in
    for (const [a, b] of [[G0, 1254], [1270, G1]]) {
      let d = `M${a} ${ROW + 2}`;
      for (let x = a; x <= b; x += 3) d += `L${x} ${r1(ROW - 5.6 - Math.abs(Math.sin(x / 7)) * 1.2)}`;
      d += `L${b} ${ROW + 2}Z`;
      back.paint("crown", d, { box: [a, ROW - 8, b - a, 10], dir: -1.4, len: 3.2, wid: 1.8, jit: 0.5, light: (x, y) => 0.3 + noise(x / 12, y) * 0.5 + (ROW - y) * 0.04 });
      back("|ink2|0.7", d);
    }
    for (const x of [1252, 1268.6]) {
      back.paint("stone", box(x, ROW - 11, 3.4, 13), { box: [x, ROW - 11, 3.4, 13], len: 3, wid: 1.2, light: lit(x, ROW - 11, 3.4, 13) });
      back("stoneHi|ink|0.7", box(x - 0.8, ROW - 12.6, 5, 1.8)); back("|ink|0.7", outline(x, ROW - 11, 3.4, 13, 0.2));
    }
    gopuram(GOP);
    rnd = rng(31);
    // trees along the row, and the park's own trees standing on its hills
    for (const [kind, x, s, g] of [["rain", 300, 1], ["palm", 520, 1], ["palm", 668, 0.95, crest(668) + 2], ["rain", 790, 1.02, crest(790) + 2], ["jac", 990, 0.92, crest(990) + 2],
      ["palm", 1108, 1.05, crest(1108) + 2], ["rain", 1286, 0.92, crest(1286) + 2], ["palm", 2470, 1.05], ["rain", 2700, 1], ["mast", 2940, 0.66], ["palm", 3150, 1], ["rain", 3330, 0.95]]) tree[kind](back, backDabs, x, g ?? ROW, s);
    const backLayer = { draw: back, sets: [brush(backDabs, "tree", 2.9)] };

    // ---------- the street in front of the metro, every surface painted ----------
    rnd = rng(41);
    const front = drawing(), nearDabs = [], roadDabs = [];
    // the road under the viaduct, in the deck's shade
    front.paint("roadBase", box(X0 - 20, ROW - 1, X1 - X0 + 40, WALK - 7 - ROW), { box: [X0 - 20, ROW - 1, X1 - X0 + 40, WALK - 7 - ROW], dir: 0, len: 13, wid: 2.4, jit: 0.06, k: 0.6, light: even(0.3) });
    // the viaduct's piers every 30 m with hammerhead caps, shaded under the deck and on their left
    for (let x = MID - 90 - 1620; x < X1 + 40; x += 180) {
      const pier = `M${x - 6} ${ROW + 3}V${SOFFIT + 11}L${x - 21} ${SOFFIT}H${x + 21}L${x + 6} ${SOFFIT + 11}V${ROW + 3}Z`;
      front.paint("conc", pier, { box: [x - 21, SOFFIT, 42, ROW + 3 - SOFFIT], len: 6, wid: 2.2, jit: 0.06, light: (px, py) => 0.2 + 0.4 * ((px - x + 6) / 12) + 0.3 * ((py - SOFFIT) / (ROW - SOFFIT)) });
      front("|ink|1", poly([[x - 6, ROW + 3], [x - 6, SOFFIT + 11], [x - 21, SOFFIT]], 0.4) + poly([[x + 21, SOFFIT], [x + 6, SOFFIT + 11], [x + 6, ROW + 3]], 0.4));
    }
    // the station's concourse hangs under the deck
    const [S0, S1] = STATION;
    front.paint("station", box(S0 + 30, SOFFIT - 1, S1 - S0 - 60, 30), { box: [S0 + 30, SOFFIT - 1, S1 - S0 - 60, 30], dir: 0, len: 8, wid: 2, light: lit(S0 + 30, SOFFIT - 1, S1 - S0 - 60, 30, 0.6) });
    front("purple||", box(S0 + 30, SOFFIT - 1, S1 - S0 - 60, 4));
    let panes = "";
    for (let x = S0 + 38; x + 9 < S1 - 36; x += 12) panes += rbox(x, SOFFIT + 7, 9, 15, 1.2);
    front.paint("stationGlass", panes, { box: [S0 + 38, SOFFIT + 7, S1 - S0 - 74, 15], len: 4, wid: 1.6, light: lit(S0 + 38, SOFFIT + 7, S1 - S0 - 74, 15, 0.8) });
    front("|ink3|0.6", panes);
    front("|ink|1", outline(S0 + 30, SOFFIT - 1, S1 - S0 - 60, 30, 0.4) + pen(S0 + 26, SOFFIT + 29, S1 - 26, SOFFIT + 29, 0.3));
    // the deck: the parapet hides the train's wheels; brushed concrete, lit on top, in shade underneath
    front.paint("conc", box(X0 - 20, PARA, X1 - X0 + 40, SOFFIT - PARA), { box: [X0 - 20, PARA, X1 - X0 + 40, SOFFIT - PARA], dir: 0, len: 15, wid: 2.4, jit: 0.04, light: (x, y) => 0.9 - 0.65 * ((y - PARA) / (SOFFIT - PARA)) });
    let joints = "";
    for (let x = MID - 90 - 1620; x < X1; x += 180) joints += `M${x} ${PARA + 1}v${SOFFIT - PARA - 2}`;
    front("|ink3|0.8", joints);
    front("|ink|1", pen(X0 - 20, PARA, X1 + 20, PARA, 0.3) + pen(X0 - 20, DECK + 1, X1 + 20, DECK + 1, 0.3) + pen(X0 - 20, SOFFIT, X1 + 20, SOFFIT, 0.3));
    // the station's roof, a white wave over the platform, on slim columns at its ends
    const roof = `M${S0} 120Q${S0 + 100} 104 ${(S0 + S1) / 2} 112Q${S1 - 100} 104 ${S1} 120L${S1 - 6} 125Q${S1 - 100} 111 ${(S0 + S1) / 2} 118Q${S0 + 100} 111 ${S0 + 6} 125Z`;
    front.paint("station", roof, { box: [S0, 104, S1 - S0, 21], dir: 0, len: 9, wid: 2, light: (x, y) => 0.85 - ((y - 104) / 21) * 0.5 });
    front("|ink|1", roof);
    front("|ink|1.6", `M${S0 + 10} 124V${PARA}M${S1 - 10} 124V${PARA}`);
    front("purple|ink|0.6", rbox(S0 + 22, 126, 26, 8, 1.5));
    front("|sgInk|0.8", `M${S0 + 27} 132v-4l3 3 3-3v4M${S0 + 37} 128h6`);
    // the footpath and its kerb: black and yellow stones, a metre each
    front.paint("walk", box(X0 - 20, WALK - 8, X1 - X0 + 40, KERB - WALK + 8), { box: [X0 - 20, WALK - 8, X1 - X0 + 40, KERB - WALK + 8], dir: 0, len: 10, wid: 2.4, jit: 0.08, k: 0.7, light: (x, y) => 0.42 + noise(x / 50, y) * 0.35 + ((y - WALK + 8) / 14) * 0.15 });
    let pave = "";
    for (let x = X0; x < X1; x += 24) pave += `M${x} ${WALK - 7}l-2 ${KERB - WALK + 6}`;
    front("|walk2|1.2", pave);
    front.paint("kerbK", box(X0 - 20, KERB, X1 - X0 + 40, 6), { box: [X0 - 20, KERB, X1 - X0 + 40, 6], len: 3.5, wid: 2, k: 0.6, light: (x, y) => 0.75 - ((y - KERB) / 6) * 0.5 });
    let kerb = "";
    for (let x = X0 - 20; x < X1 + 20; x += 48) kerb += box(x, KERB, 24, 6);
    front.paint("kerbY", kerb, { box: [X0 - 20, KERB, X1 - X0 + 40, 6], len: 3.5, wid: 2, light: (x, y) => 0.78 - ((y - KERB) / 6) * 0.5 });
    front("|ink|1", pen(X0 - 20, WALK - 8, X1 + 20, WALK - 8, 0.3) + pen(X0 - 20, KERB, X1 + 20, KERB, 0.3) + pen(X0 - 20, KERB + 6, X1 + 20, KERB + 6, 0.3));
    // the road: long rows of marks along it, darker in the kerb's shadow
    front("roadBase||", box(X0 - 20, KERB + 6, X1 - X0 + 40, H - KERB));
    // shadows on the footpath: the near trees' to the lower left (the light is upper right), the lamps' thin ones
    const nearTrees = [["pink", 360, 1.1], ["mast", 870, 0.92], ["flame", 1060, 1.15], ["mast", 1398, 0.94], ["mast", 2010, 0.94], ["pink", 2470, 1.15], ["flame", 2830, 1.1], ["mast", 3080, 0.92]];
    const lamps = [1468, 1932];
    for (const [kind, x, s] of nearTrees) {
      const rx = { pink: 32, flame: 44, mast: 14 }[kind] * s, cx = x - rx * 0.7 - 10;
      front.paint("walkShade", oval(cx, WALK - 3, rx, 3.6), { box: [cx - rx, WALK - 7, rx * 2, 8], dir: 0, len: 8, wid: 2.2, k: 0.5, light: even(0.4) });
    }
    for (const x of lamps) front("|walkShade|2.2", `M${x - 2} ${WALK - 2}l-26 3`);
    rnd = rng(43);
    for (const [kind, x, s] of nearTrees) tree[kind](front, nearDabs, x, WALK - 6, s);
    rnd = rng(47);
    const roadFlow = (x, y) => { const vy = 0.07 * Math.sin(x / 90 + y / 7) + 0.04 * Math.sin(x / 23), n = Math.hypot(1, vy); return [1 / n, vy / n]; };
    marks(streams({ x0: X0, y0: KERB + 9, x1: X1, y1: H - 1, flow: roadFlow, sep: 4.4, step: 2, max: 300, every: 8 }), {
      len: 16, gap: 3, out: roadDabs,
      tone: (x, y, lean) => {
        if (lamps.some((lx) => Math.abs(x - lx - 2) < 14 - (y - KERB) * 0.12) && rnd() < 0.8) return 5;
        const t = noise(x / 70, y / 8) * 0.6 + lean * 0.3 + rnd() * 0.15 - (y < KERB + 15 ? 0.3 : 0);
        return t < 0.3 ? 0 : t < 0.48 ? 1 : t < 0.64 ? 2 : t < 0.8 ? 3 : 4;
      },
    });
    const frontLayer = { draw: front, sets: [brush(nearDabs, "tree", 2.9), brush(roadDabs, "road", 3.6)] };
    // over the marks: lane dashes and the heritage lamps round Vidhana Soudha, glowing after dark
    const laneDash = new Path2D(Array.from({ length: Math.ceil((X1 - X0) / 46) }, (_, k) => `M${X0 + k * 46} ${LANE1 + 6.5}h22`).join(""));
    const lampPost = new Path2D(lamps.map((x) => `M${x - 3.4} ${WALK}h6.8l-1-4h-4.8zM${x - 1.6} ${WALK - 4}L${x - 1} ${WALK - 74}h2L${x + 1.6} ${WALK - 4}zM${x - 3} ${WALK - 70}h6v2h-6z`).join(""));
    const lampLit = new Path2D(lamps.map((x) => `M${x + 0.9} ${WALK - 5}L${x + 0.6} ${WALK - 72}`).join(""));
    const lantern = new Path2D(lamps.map((x) => `M${x - 4} ${WALK - 76}h8l-1.4-10h-5.2zM${x - 5} ${WALK - 86}h10l-5-5z`).join(""));
    frontLayer.over = (c) => {
      c.strokeStyle = pal.lane; c.lineWidth = 2; c.stroke(laneDash);
      if (pal.night) for (const x of lamps) {
        const pool = c.createRadialGradient(x, WALK - 2, 1, x, WALK - 2, 40);
        pool.addColorStop(0, "rgba(255,206,110,0.32)"); pool.addColorStop(1, "rgba(255,206,110,0)");
        c.save(); c.translate(0, WALK - 2); c.scale(1, 0.22); c.translate(0, -(WALK - 2)); c.fillStyle = pool; c.fillRect(x - 40, WALK - 42, 80, 80); c.restore();
        const g = c.createRadialGradient(x, WALK - 82, 2, x, WALK - 82, 56);
        g.addColorStop(0, "rgba(255,214,120,0.5)"); g.addColorStop(0.35, "rgba(255,200,100,0.16)"); g.addColorStop(1, "rgba(255,200,100,0)");
        c.fillStyle = g; c.fillRect(x - 60, WALK - 140, 120, 120);
        c.strokeStyle = "rgba(255,214,120,0.55)"; c.lineWidth = 1.6; c.setLineDash([4, 5]);
        for (const rr of [13, 20, 28]) { c.beginPath(); c.arc(x, WALK - 82, rr, 0, 7); c.stroke(); }
        c.setLineDash([]);
      }
      c.fillStyle = pal.post; c.fill(lampPost);
      c.strokeStyle = pal.night ? "rgba(255,214,120,0.6)" : "rgba(255,255,255,0.45)"; c.lineWidth = 0.8; c.stroke(lampLit);
      c.fillStyle = pal.lantern; c.fill(lantern);
      c.strokeStyle = pal.ink; c.lineWidth = 0.8; c.stroke(lantern); c.stroke(lampPost);
    };

    const layers = [sky, backLayer, frontLayer];
    for (const Lr of layers) { Lr.base = document.createElement("canvas"); Lr.comp = document.createElement("canvas"); Lr.dirty = null; }

    // ---------- figures: ink outlines, painted in brush marks with light and shade, kept as small images ----------
    let LX = 1;     // which way the light falls on the figure being painted: 1 from its right, -1 from its left (mirrored)
    let seedN = 1;  // each part's marks come from their own seed, so every frame of a walk is painted alike
    // the box round a path, from its drawing commands (control points count, so it is a little generous)
    const bounds = (d) => {
      const tk = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)/g) || [];
      let i = 0, cmd = "M", x = 0, y = 0, sx = 0, sy = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (px, py, r = 0) => { x0 = Math.min(x0, px - r); y0 = Math.min(y0, py - r); x1 = Math.max(x1, px + r); y1 = Math.max(y1, py + r); };
      const num = () => +tk[i++];
      while (i < tk.length) {
        if (/[a-zA-Z]/.test(tk[i])) { cmd = tk[i++]; if (cmd === "z" || cmd === "Z") { x = sx; y = sy; continue; } }
        const C = cmd.toUpperCase(), ox = cmd === C ? 0 : x, oy = cmd === C ? 0 : y;
        if (C === "H") add((x = num() + ox), y);
        else if (C === "V") add(x, (y = num() + oy));
        else if (C === "A") { const r = Math.max(num(), num()); i += 3; add(x, y, r); x = num() + ox; y = num() + oy; add(x, y, r); }
        else {
          const n = C === "C" ? 3 : C === "Q" || C === "S" ? 2 : 1;
          for (let k = 0; k < n; k++) { const px = num() + ox, py = num() + oy; add(px, py); if (k === n - 1) { x = px; y = py; } }
          if (C === "M") { sx = x; sy = y; cmd = cmd === "M" ? "L" : "l"; }
        }
      }
      return [x0, y0, x1 - x0, y1 - y0];
    };
    const circle = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); p.box = [x - r, y - r, 2 * r, 2 * r]; return p; };
    const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(), m = Math.max(rx, ry); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); p.box = [x - m, y - m, 2 * m, 2 * m]; return p; };
    const shifted = (p, dx, dy) => { const q = new Path2D(); q.addPath(p); q.addPath(p, new DOMMatrix([1, 0, 0, 1, dx, dy])); return q; };
    // a limb or a garment round a line through its joints: ws is its width at each joint (or one width, tapering by a quarter)
    const taper = (pts, ws) => {
      const n = pts.length, A = [], B = [], W = [];
      for (let k = 0; k < n; k++) {
        const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const w = (Array.isArray(ws) ? ws[k] : ws * (1 - (0.25 * k) / (n - 1))) / 2, nx = (-(b[1] - a[1]) / d) * w, ny = ((b[0] - a[0]) / d) * w;
        W.push(w); A.push([pts[k][0] + nx, pts[k][1] + ny]); B.push([pts[k][0] - nx, pts[k][1] - ny]);
      }
      const p = new Path2D();
      const side = (q) => { for (let k = 1; k < n - 1; k++) p.quadraticCurveTo(q[k][0], q[k][1], (q[k][0] + q[k + 1][0]) / 2, (q[k][1] + q[k + 1][1]) / 2); p.lineTo(q[n - 1][0], q[n - 1][1]); };
      const cap = (k, from, to) => p.arc(pts[k][0], pts[k][1], W[k], Math.atan2(from[1] - pts[k][1], from[0] - pts[k][0]), Math.atan2(to[1] - pts[k][1], to[0] - pts[k][0]), true);
      p.moveTo(A[0][0], A[0][1]); side(A); cap(n - 1, A[n - 1], B[n - 1]);
      const back = B.slice().reverse(); side(back); cap(0, B[0], A[0]); p.closePath();
      const xs = A.concat(B).map((q) => q[0]), ys = A.concat(B).map((q) => q[1]), mw = Math.max(...W);
      p.box = [Math.min(...xs) - mw, Math.min(...ys) - mw, Math.max(...xs) - Math.min(...xs) + 2 * mw, Math.max(...ys) - Math.min(...ys) + 2 * mw];
      return p;
    };
    // a painted part: its colour, brush marks over it toned by the light (from the upper right), deeper marks in the shade
    // on its far side, lighter ones along its lit edge, then an ink outline. o: sh (how deep the shade and lit edges go),
    // k (how strong the tones are), dir (which way the marks run: an angle, or a function of the point), len and wid (their
    // size in drawing units), jit, ink (outline width, 0 for none), tex: 0 for smooth things (glass, lamps)
    const part = (g, d, colour, o = {}) => {
      const p = typeof d === "string" ? new Path2D(d) : d, base = mp[colour] ?? colour, sh = o.sh ?? 1.4;
      g.fillStyle = base; g.fill(p);
      if (base[0] === "#" && (sh > 0 || o.tex !== 0)) {
        const t = tonesOf(base, o.k ?? 1), [bx, by, bw, bh] = o.box ?? (p.box ||= typeof d === "string" ? bounds(d) : [-60, -120, 160, 140]);
        const m = g.getTransform(), unit = Math.hypot(m.a, m.b) / S, seed = seedN++, len = (o.len ?? 2.8) / unit, wid = (o.wid ?? 1.1) / unit;
        const dabs = o.tex === 0 ? null : brushFill({ box: [bx - wid, by - wid, bw + 2 * wid, bh + 2 * wid], dir: o.dir ?? -1.2, len: len / BOLD, wid: wid / BOLD, jit: o.jit ?? 0.3, seed,
          light: (x, y) => 0.52 + 0.14 * (LX * ((x - bx) / bw - 0.5) - ((y - by) / bh - 0.5)) });
        g.save(); g.clip(p);
        if (dabs) strokeFill(g, dabs, t, wid);
        if (sh > 0) for (const [dx, dy, v, ts] of [[sh * LX, -sh * 0.35, 1, [t[0], t[0], t[0], t[1], t[1]]], [-sh * 0.6 * LX, sh * 0.35, 3, [t[2], t[3], t[3], t[4], t[4]]]]) {
          g.save(); g.clip(shifted(p, dx, dy), "evenodd");
          if (dabs) strokeFill(g, dabs, ts, wid); else { g.fillStyle = t[v]; g.fillRect(bx - 5, by - 5, bw + 10, bh + 10); }
          g.restore();
        }
        g.restore();
      }
      if (o.ink !== 0) {
        // the contour, in Prussian blue, thickening on the shaded side as a loaded brush would leave it, gone over once
        // more a little off the line, as a painter's second pass
        const w = o.ink ?? 0.8, outside = new Path2D();
        g.strokeStyle = mp.ink; g.lineWidth = w * 0.65; g.stroke(p);
        outside.rect(-1e4, -1e4, 2e4, 2e4); outside.addPath(p);
        g.save(); g.clip(outside, "evenodd"); g.translate(-0.45 * w * LX, 0.35 * w); g.lineWidth = w * 0.8; g.stroke(p); g.restore();
        g.save(); g.globalAlpha = 0.45; g.translate(0.3 * w, -0.22 * w); g.lineWidth = w * 0.45; g.stroke(p); g.restore();
      }
    };
    // an arm or a leg: a tapering shape round its joints, painted along its length
    const limb = (g, pts, w, colour, o = {}) => {
      const a = pts[0], b = pts[pts.length - 1];
      part(g, taper(pts, w), colour, { sh: (Array.isArray(w) ? w[0] : w) * 0.3, dir: Math.atan2(b[1] - a[1], b[0] - a[0]), jit: 0.2, ink: 0.7, len: 2, ...o });
    };
    const line = (g, d, colour, w) => { g.strokeStyle = mp[colour] ?? colour; g.lineWidth = w; g.stroke(typeof d === "string" ? new Path2D(d) : d); };
    const far = (k) => mix(mp[k], "#000000", 0.22); // the far arm or leg, a step into the shade
    const round = (cx, cy) => (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2; // marks that run round a point
    const fig = (spec) => spec.map(([g, d, f, s, w, sh, o]) => { const p = new Path2D(d); p.box = bounds(d); return { g, p, f, s, w, sh, o }; });
    const paintFig = (g, parts, tf = {}, sh = 1.3) => {
      let cur;
      for (const q of parts) {
        if (q.g !== cur) { if (cur !== undefined) g.restore(); cur = q.g; g.save(); if (tf[cur]) tf[cur](g); }
        if (q.f) part(g, q.p, q.f, { sh: q.sh ?? sh, ink: q.s ? q.w || 0.8 : 0, ...q.o });
        else if (q.s) line(g, q.p, q.s, q.w || 1);
      }
      if (cur !== undefined) g.restore();
    };
    // an image of a figure, in drawing units round its origin (feet or wheels on the ground at 0)
    const sprite = (x0, y0, x1, y1, draw) => {
      const c = document.createElement("canvas"), w = x1 - x0, h = y1 - y0;
      c.width = Math.max(1, Math.ceil(w * S)); c.height = Math.max(1, Math.ceil(h * S));
      const g = c.getContext("2d");
      g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
      g.lineCap = g.lineJoin = "round";
      LX = 1; seedN = 1;
      draw(g);
      LX = 1;
      return { c, x0, y0, w, h };
    };
    const blit = (c, sp, x, y) => c.drawImage(sp.c, x + sp.x0, y + sp.y0, sp.w, sp.h);
    // people on the footpath are drawn a little larger than its scale, so their painting reads
    const P = 1.15, person = (x0, y0, x1, y1, draw) => sprite(x0 * P, y0 * P, x1 * P, y1 * P, (g) => { g.scale(P, P); draw(g); });
    const under = (g, sp) => { g.save(); g.scale(1 / P, 1 / P); g.drawImage(sp.c, sp.x0, sp.y0, sp.w, sp.h); g.restore(); }; // a part painted once
    const spr = {};

    // a wheel, painted once in marks that run round it and turned as it rolls; the light on it stays put
    const wheelSprite = (rr) => sprite(-rr - 0.6, -rr - 0.6, rr + 0.6, rr + 0.6, (g) => {
      part(g, circle(0, 0, rr), "tyre", { sh: 0, dir: round(0, 0), len: 1.8, wid: 0.8, jit: 0.15, ink: 0.6 });
      part(g, circle(0, 0, rr * 0.56), "hub", { sh: 0, dir: round(0, 0), len: 1.2, wid: 0.6, jit: 0.2, ink: 0.4 });
      g.fillStyle = mp.ink2;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(Math.cos(k * 1.571) * rr * 0.3, Math.sin(k * 1.571) * rr * 0.3, rr * 0.08, 0, 7); g.fill(); }
      g.beginPath(); g.arc(0, 0, rr * 0.12, 0, 7); g.fill();
    });
    const wheelAt = (c, sp, x, y, rr, a) => {
      c.save(); c.translate(x, y); c.rotate(a); c.drawImage(sp.c, sp.x0, sp.y0, sp.w, sp.h); c.restore();
      c.lineCap = "round";
      c.strokeStyle = pal.night ? "rgba(160,180,240,0.28)" : "rgba(255,250,230,0.42)"; c.lineWidth = rr * 0.16; c.beginPath(); c.arc(x, y, rr * 0.8, -1.5, -0.25); c.stroke();
      c.strokeStyle = pal.night ? "rgba(0,0,20,0.35)" : "rgba(40,36,100,0.28)"; c.lineWidth = rr * 0.22; c.beginPath(); c.arc(x, y, rr * 0.76, 1.7, 3.5); c.stroke();
    };
    // headlamps after dark: a soft cone of light, brightest at the lamp and fading at its edges, and the pool it throws on
    // the road ahead. Drawn with "lighter", so what it falls on (the road's marks, the cow) shows through, lit. Built
    // pointing right with the lamp at 0,0 and the road h below it.
    const beamSprite = (h, len, rgb, pool = true) => sprite(-9, -len * 0.26, len + 6, h + 12, (g) => {
      const a = (v) => `rgba(${rgb},${v})`;
      g.save(); g.beginPath(); g.rect(-9, -len, len + 20, len + h + 1); g.clip(); // the cone stops at the road
      for (const [up, down, k] of [[0.05, 0.2, 0.8], [0.11, 0.3, 0.5], [0.19, 0.42, 0.3]]) {
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, len);
        rg.addColorStop(0, a(0.5 * k)); rg.addColorStop(0.3, a(0.24 * k)); rg.addColorStop(1, a(0));
        g.fillStyle = rg; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, len, -up, down); g.closePath(); g.fill();
      }
      g.restore();
      if (pool) {
        // where the beam meets the road (its lower edge comes down at d0), fading in towards the vehicle and away ahead,
        // so it reads as the same lamp's light and not a second one at the wheel
        const d0 = h / Math.tan(0.42), cx = d0 + (len - d0) * 0.3, rx = (len - d0) * 0.62;
        g.save(); g.translate(0, h - 3); g.scale(1, 0.12);
        const rg = g.createRadialGradient(cx, 0, 0, cx, 0, rx);
        rg.addColorStop(0, a(0.55)); rg.addColorStop(0.5, a(0.24)); rg.addColorStop(1, a(0));
        g.fillStyle = rg; g.fillRect(cx - rx, -rx, 2 * rx, 2 * rx);
        g.restore();
      }
      const halo = g.createRadialGradient(0, 0, 0, 0, 0, 9);
      halo.addColorStop(0, a(0.95)); halo.addColorStop(0.25, a(0.4)); halo.addColorStop(1, a(0));
      g.fillStyle = halo; g.fillRect(-9, -9, 18, 18);
    });
    const glowSprite = (r, rgb) => sprite(-r, -r, r, r, (g) => {
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, r);
      rg.addColorStop(0, `rgba(${rgb},0.85)`); rg.addColorStop(0.3, `rgba(${rgb},0.3)`); rg.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = rg; g.fillRect(-r, -r, 2 * r, 2 * r);
    });
    const lightUp = (c, sp, x, y, dir = 1) => {
      c.save(); c.globalCompositeOperation = "lighter"; c.translate(x, y); c.scale(dir, 1);
      c.drawImage(sp.c, sp.x0, sp.y0, sp.w, sp.h); c.restore();
    };

    // Namma Metro (6 px/m): three 21 m coaches in steel with the purple line's band, four doors a side, cabs at both ends
    const MW = 126, TRAIN = MW * 3 + 6;
    rnd = rng(61);
    const train = (() => {
      let body = "", band = "", win = "", roofs = "", gang = "", pax = "", glass = "", doorP = "", doorW = "";
      const doors = [];
      for (let k = 0; k < 3; k++) {
        const x0 = k * (MW + 3), end = k === 2 ? 1 : k === 0 ? -1 : 0;
        body += end === 1 ? `M${x0} 1.5H${x0 + MW - 9}Q${x0 + MW - 1.5} 1.5 ${x0 + MW - 0.6} 8.5L${x0 + MW} 24H${x0}Z`
          : end === -1 ? `M${x0 + MW} 1.5H${x0 + 9}Q${x0 + 1.5} 1.5 ${x0 + 0.6} 8.5L${x0} 24H${x0 + MW}Z`
          : `M${x0} 3Q${x0} 1.5 ${x0 + 1.5} 1.5H${x0 + MW - 1.5}Q${x0 + MW} 1.5 ${x0 + MW} 3V24H${x0}Z`;
        band += box(x0, 14.6, MW, 2.6) + box(x0 + 2, 3, MW - 4, 1);
        if (end === 1) glass += `M${x0 + MW - 8} 4.6Q${x0 + MW - 2.6} 4.6 ${x0 + MW - 1.8} 9L${x0 + MW - 1.6} 11.4H${x0 + MW - 8}Z`;
        if (end === -1) glass += `M${x0 + 8} 4.6Q${x0 + 2.6} 4.6 ${x0 + 1.8} 9L${x0 + 1.6} 11.4H${x0 + 8}Z`;
        const ds = [19, 49, 79, 109].map((f) => x0 + f);
        doors.push(...ds);
        for (const d of ds) { doorP += box(d - 5, 4.4, 5, 19.6) + box(d, 4.4, 5, 19.6); doorW += box(d - 4, 6, 3, 5) + box(d + 1, 6, 3, 5); }
        const edges = [end === -1 ? x0 + 10 : x0 + 3, ...ds.flatMap((d) => [d - 6, d + 6]), end === 1 ? x0 + MW - 10 : x0 + MW - 3];
        for (let g = 0; g < edges.length; g += 2) {
          const a = edges[g], b = edges[g + 1], n = Math.max(1, Math.floor((b - a + 2) / 11)), w = (b - a - (n - 1) * 2) / n;
          for (let m = 0; m < n; m++) {
            const wx = a + m * (w + 2);
            win += rbox(wx, 5, w, 6.6, 1);
            if (rnd() < 0.55) { const hx = wx + between(2, w - 2); pax += `M${r1(hx - 1.4)} 9a1.4 1.4 0 1 1 2.8 0a1.4 1.4 0 1 1-2.8 0M${r1(hx - 2.6)} 11.6q2.6-2.2 5.2 0z`; }
          }
        }
        roofs += box(x0 + 24, 0, 18, 1.6) + box(x0 + 84, 0, 18, 1.6);
        if (k < 2) gang += box(x0 + MW, 4, 3, 18);
      }
      return { doors, body, band, win, roofs, gang, pax, glass, doorP, doorW };
    })();
    const metroSprite = () => sprite(-1, -1, TRAIN + 1, 25, (g) => {
      part(g, train.body, "steel", { sh: 2.2, k: 0.7, ink: 0.9, dir: 0, len: 5, jit: 0.08 });
      part(g, train.roofs, "steel2", { sh: 0.6, tex: 0, ink: 0.5 });
      part(g, train.gang, "gang", { sh: 0, tex: 0, ink: 0 });
      part(g, train.win, "mwin", { sh: 0.8, tex: 0, ink: 0.4 });
      g.fillStyle = "rgba(15,15,25,0.5)"; g.fill(new Path2D(train.pax));
      part(g, train.glass, "mglass", { sh: 0.6, tex: 0, ink: 0.5 });
      part(g, train.band, "purple", { sh: 0.5, dir: 0, len: 4, ink: 0 });
      part(g, train.doorP, "steel2", { sh: 0.8, k: 0.6, dir: -Math.PI / 2, len: 3, ink: 0.5 });
      part(g, train.doorW, "mwin", { sh: 0, tex: 0, ink: 0 });
      part(g, circle(TRAIN - 1.2, 17.6, 1.1), "lamp", { sh: 0, tex: 0, ink: 0 });
      part(g, circle(1.2, 17.6, 1), "tail", { sh: 0, tex: 0, ink: 0 });
    });
    const drawMetro = (c, x, open) => {
      blit(c, spr.metro, x, PARA - 22);
      if (pal.night) lightUp(c, spr.beamM, x + TRAIN, PARA - 4.4);
      if (open > 0.02) for (const d of train.doors) {
        const gap = open * 4.4;
        c.fillStyle = pal.night ? "#ffe29a" : "#40485a"; c.fillRect(x + d - gap, PARA - 17.6, gap * 2, 19.6);
        c.strokeStyle = mp.ink; c.lineWidth = 0.5; c.strokeRect(x + d - gap, PARA - 17.6, gap * 2, 19.6);
      }
    };
    const shadowAt = (c, x, y, rx, ry) => {
      c.save(); c.translate(x - rx * 0.2, y); c.scale(1, ry / rx);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, pal.groundShadow); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill(); c.restore();
    };

    // the auto rickshaw (28 px/m), after Bangalore's Bajaj REs: the front wheel well out under a rounded green nose with
    // the lamp in its black face, the windscreen leaning back under the yellow canopy's peak, the canopy running back and
    // curving down into the yellow back with its little window, the green body over the rear wheel with its ribbed panel,
    // the fare meter on its rod, a driver in a beige shirt and a passenger in a red kurta. Heading left.
    const AK = 0.736, AW = [3, 80], AR = 8.4; // drawn about 104 long for its 2.7 m; where its wheels are, and their size
    const autoSprite = () => sprite(-7, -51, 76, 1.5, (g) => {
      g.scale(AK, AK);
      const along = { dir: 0, jit: 0.12, len: 3.2 };
      // inside the cab, and the passenger on the back seat with her bag on her lap
      part(g, "M22 -57.4H75V-16H22Z", "interior", { sh: 0, tex: 0, ink: 0 });
      part(g, "M67.6 -45.6Q67.6 -49.4 71.4 -49.4H75V-27H67.6Z", "backrest", { sh: 1.4, dir: -1.5 });
      part(g, "M56.4 -28.8H75V-25H56Z", "seatB", { sh: 0.8, ...along });
      limb(g, [[66, -29.6], [57.4, -29.4], [55.2, -17.8]], [5.4, 4.2, 3.2], "white");
      part(g, "M52.4 -18.8h5.4q1.6 0 1.6 1.8v.6h-7z", "shoe2", { sh: 0, tex: 0, ink: 0.5 });
      part(g, "M60.4 -29.4Q59.6 -40 61.6 -46.2Q65 -49.2 68.6 -46.8Q70.6 -38 70.4 -29.4Z", "kurta", { sh: 2, dir: -1.5 });
      part(g, "M70.6 -30.6L70.8 -26H58.8Q58.2 -29 60.4 -30.8Z", "kurta", { sh: 1, dir: 0 });
      part(g, circle(64.8, -52.4, 3.7), "skin", { sh: 1.2, len: 1.6 });
      part(g, "M61.2 -53.4Q61.4 -57 65 -56.6Q68 -56.2 68.4 -53.2Q66.4 -54.6 64 -54Q62.4 -53.2 61.2 -53.4Z", "hair", { sh: 0.5, len: 1.4 });
      part(g, circle(68.6, -53.4, 2), "hair", { sh: 0.5, len: 1.4 });
      limb(g, [[64.6, -45.4], [62.6, -37.8], [59, -34]], [3.4, 2.8, 2.4], "kurta");
      part(g, "M56.6 -36.4h9.6v6.6h-9.6z", "bagB", { sh: 1.2 });
      part(g, ellipse(58.6, -34.4, 1.6, 1.3), "skin", { sh: 0.4, ink: 0.5 });
      // the driver on his seat behind the windscreen, hands on the handlebar
      part(g, "M29.6 -27.6H46V-16H29.6Z", "seatB", { sh: 1.2, ...along });
      part(g, "M42.6 -32.4Q42.6 -34.4 44.6 -34.4H47V-27.4H42.6Z", "backrest", { sh: 0.8 });
      limb(g, [[37, -29.6], [27.4, -30.6], [25.2, -17.6]], [5.8, 4.4, 3.4], "trouser");
      part(g, "M22.2 -18.6h5.6q1.6 0 1.6 1.8v.6h-7.2z", "shoe2", { sh: 0, tex: 0, ink: 0.5 });
      part(g, "M30.8 -29.4Q29.4 -40 31.2 -46.8Q35 -50 38.8 -47.6Q41.8 -39 41.6 -29.4Z", "shirtB", { sh: 2.2, dir: -1.45 });
      part(g, circle(34.4, -52.6, 3.9), "skin", { sh: 1.2, len: 1.6 });
      part(g, "M30.6 -53.2Q30.6 -57.2 34.6 -57Q38.4 -56.8 38.4 -52.4Q36.8 -54.4 34 -54.2Q32 -53.6 30.6 -53.2Z", "hair", { sh: 0.5, len: 1.4 });
      line(g, "M30.8 -51.2q1.2.8 2.4.2", "hair", 0.8);
      limb(g, [[34.4, -45.8], [29.6, -38.8], [22.4, -40.8]], [3.6, 3, 2.6], "shirtB");
      part(g, ellipse(21.6, -40.8, 1.6, 1.4), "skin", { sh: 0.4, ink: 0.5 });
      line(g, "M19.4 -41.6L24 -43.4", "ink", 1.3);
      // the grab rod and the fare meter on it
      line(g, "M47.4 -57.2V-27.6", "silver", 1.4);
      part(g, "M44.4 -52.4h6v7.6h-6z", "meter", { sh: 0.8, tex: 0, ink: 0.5 });
      part(g, "M45 -54.4h4.8v2h-4.8z", "tail", { sh: 0, tex: 0, ink: 0.4 });
      // the floor's edge, and the body over the rear wheel with its ribbed panel
      part(g, "M22 -16.6H58V-11H22.4Z", "autoG", { sh: 1, ...along });
      part(g, "M56 -28H100.2Q102 -28 102 -26V-11.2H91.6Q91 -19.8 80 -20Q69 -19.8 68.4 -11.2H56.4Z", "autoG", { sh: 2.2, ...along });
      line(g, "M84 -25H100.6M84 -22.4H100.6M92.6 -19.8H100.6", "ink2", 0.6);
      line(g, "M68.4 -11.2Q69 -19.8 80 -20Q91 -19.8 91.6 -11.2", "ink", 1.2);
      part(g, "M100.6 -26.4h1.8v5.4h-1.8z", "tail", { sh: 0, tex: 0, ink: 0.5 });
      // the canopy: a peak over the windscreen, the roof, and the curve down into the yellow back with a little window
      part(g, "M3 -62.8Q3.2 -67.8 9 -68L86 -66.6Q99.4 -65.8 101 -50.4L102 -27.8H74.6V-57.2H16.6L15 -58.8Q8 -59.4 3 -62.8Z", "hood",
        { sh: 2.4, len: 3.4, jit: 0.12, dir: (x, y) => (x < 88 ? 0.02 : Math.atan2(y + 50, x - 88) + Math.PI / 2) });
      part(g, "M80.6 -53.4H91.4Q95.6 -53.2 96.2 -47.8L96.8 -38.6H80.6Z", "interior", { sh: 0.8, tex: 0, ink: 0.6 });
      line(g, "M16.6 -57.2H74.6V-28", "ink", 1.3);
      line(g, "M9 -66.2L86 -64.8Q97 -64 98.8 -51", "rgba(255,255,255,0.35)", 0.9);
      part(g, "M3 -62.8Q3.2 -67.8 9 -68L10 -66.6Q5.4 -66 5.2 -62.2Z", "capGrey", { sh: 0.6, tex: 0, ink: 0.4 });
      // the windscreen, leaning back
      part(g, "M9.2 -41.6L14.6 -58.6L20.2 -57.6L22 -41.6Z", "glassA", { sh: 0.8, tex: 0 });
      line(g, "M13.4 -55.6L11.4 -46.6M16 -55L15 -50.4", "rgba(255,255,255,0.75)", 0.9);
      // the nose, well out over the front wheel, its black face with the lamp, the indicator under the windscreen
      part(g, "M8.6 -42H24.4L25.2 -15.8H13.2Q12.4 -20.6 3 -20.8Q-6.2 -20.6 -7 -15L-8 -15.6Q-8.4 -26.4 -5.2 -33.6Q-1.6 -40.4 8.6 -42Z", "autoG",
        { sh: 2.4, len: 3, jit: 0.15, dir: (x) => (x < 7 ? -1.3 : 0) });
      part(g, "M-4.8 -34Q-1.6 -38.4 4.6 -38.6L5 -26H-6.6Q-6.6 -30.4 -4.8 -34Z", "grille", { sh: 0.8, len: 1.6 });
      part(g, circle(-0.8, -31.4, 2.5), "lamp", { sh: 0, tex: 0, ink: 0.6 });
      line(g, circle(-0.8, -31.4, 3.1), "silver", 0.8);
      part(g, "M3.8 -40.8h3.6v2.2h-3.6z", "amber", { sh: 0, tex: 0, ink: 0.4 });
      line(g, "M-7 -15Q-6.2 -20.6 3 -20.8Q12.4 -20.6 13.2 -15.8", "ink", 1.2);
    });
    const drawAuto = (c, m) => {
      const x0 = m.x - 50 * AK, y = LANE2 + m.bump, rr = AR * AK;
      shadowAt(c, m.x, LANE2, 44, 4.4);
      for (const wx of AW) wheelAt(c, spr.wheelA, x0 + wx * AK, LANE2 - rr, rr, -m.d / rr);
      blit(c, spr.auto, x0, y);
      if (pal.night) { lightUp(c, spr.beamA, x0 - 0.8 * AK, y - 31.4 * AK, -1); lightUp(c, spr.tail, x0 + 101.6 * AK, y - 23.6 * AK); }
    };

    // a delivery rider on a black scooter (26 px/m), sitting in the middle of the seat and leaning into the ride, hands on
    // the grips: orange helmet and jacket with a reflective band, black trousers, an orange box (no brand) on the carrier
    // behind him. Heading right.
    const SK = 0.48, SW = [16, 84], SR = 11.5; // drawn 100 long for its 1.85 m; where its wheels are, and their size
    const scooterSprite = () => sprite(-1.5, -48, 49, 1.5, (g) => {
      g.scale(SK, SK);
      const along = { dir: 0, jit: 0.15, len: 3.4, wid: 1.1 };
      line(g, "M0 -46.4H31M27 -46.4L31 -40", "silver", 1.8);
      part(g, "M18 -15Q16.6 -20.4 22.4 -22.4L46 -27.4H56L52.4 -15Q50.6 -12 46 -12H24Q19 -12 18 -15Z", "gang", { sh: 1.4, ...along });
      part(g, "M1.6 -31Q0.4 -42.4 10 -45.4L55 -46Q61.6 -45.4 62.4 -38.4L63.2 -26H47Q40 -26 35 -28Q28 -29.6 16 -29.8Q5.4 -29.6 2.6 -26.6Z", "black", { sh: 3.6, k: 1.2, ...along });
      line(g, "M10 -40.4Q34 -42.8 58 -41", "silver", 1.2);
      part(g, "M1.4 -38.6Q-.6 -35.6 .4 -32.2L3.2 -32.6Q2.6 -35.6 3.8 -38.4Z", "tail", { sh: 0, tex: 0, ink: 0.5 });
      part(g, "M56 -26.4H73.4L74.8 -21H54.4Z", "black", { sh: 1, ...along });
      line(g, "M84 -11.5L87.4 -32", "silver", 2);
      part(g, "M71 -21.4Q74.4 -42 77 -64.4L84.6 -67.4Q90.6 -66.4 91 -60.4Q88.6 -46 92.2 -34Q95.2 -28 96.4 -24L91 -23.4Q88.6 -27.8 84 -28Q78.6 -27.8 75.6 -21.4Z", "black",
        { sh: 3, k: 1.2, len: 3.2, jit: 0.2, dir: -1.25 });
      part(g, "M73 -20Q74.4 -28.4 84 -28.6Q93.6 -28.4 95.6 -19.4L93 -19.4Q91.6 -25.8 84 -26Q76.6 -25.8 75.4 -20Z", "black", { sh: 0.8, k: 1.2, tex: 0 });
      part(g, "M74.6 -64Q77 -71.8 88 -71.6Q93.8 -71 93.2 -65.6L91.4 -63.4H76Z", "black", { sh: 1.4, k: 1.2, ...along });
      part(g, "M90.4 -70.2Q95.8 -70 95.6 -65.8Q94.4 -63.6 90.6 -64Z", "lamp", { sh: 0, tex: 0, ink: 0.6 });
      line(g, "M82 -71.2L80.2 -80", "ink", 1.1);
      part(g, ellipse(80.4, -81.4, 2.8, 1.7), "black", { sh: 0, tex: 0, ink: 0.6 });
      part(g, "M12 -45.2Q13 -50.6 24 -51.2H53Q58.6 -50.8 58.8 -46.6L56.6 -45.2Z", "seatB", { sh: 1.4, ...along });
      part(g, "M0 -77Q0 -79.4 2.4 -79.4H27.6Q30 -79.4 30 -77V-49.4Q30 -47 27.6 -47H2.4Q0 -47 0 -49.4Z", "bag", { sh: 3.4, dir: -1.45, len: 3, jit: 0.15 });
      line(g, "M.4 -72.6H29.6", "bag2", 1.4);
      part(g, "M10 -66.4h10v9h-10z", "white", { sh: 0.8, tex: 0, ink: 0.7 });
      limb(g, [[38.6, -50.6], [59.6, -53], [61.6, -28.4]], [11, 8, 6.4], "trouserB", { sh: 2.4, k: 1.1 });
      part(g, "M57.6 -29.6h8.6q3 0 3 2.8v1H57.6z", "shoe2", { sh: 0.8, tex: 0, ink: 0.6 });
      part(g, "M31 -49Q29.4 -66.4 36.6 -79.2Q41 -84.6 46.6 -83.2Q52.8 -80.6 52.6 -74Q51.6 -62 48.8 -48.8Z", "jacket", { sh: 3.4, dir: -1.35, len: 3, jit: 0.25 });
      line(g, "M31.6 -60.4Q40 -61.6 50.8 -60.6", "silver", 1.6);
      part(g, "M44 -84.6h5.8v4.8H44z", "skin", { sh: 0.8, ink: 0.6 });
      part(g, circle(48.6, -90.6, 8), "helmO", { sh: 3, len: 2, dir: round(48.6, -90.6) });
      part(g, "M50.4 -87.4Q55.8 -87.2 56.6 -84.6Q54 -82.4 49.2 -82.8Z", "helmO", { sh: 0.8, tex: 0, ink: 0.6 });
      part(g, "M51.2 -96Q57.8 -96.4 57 -88.4L50.4 -87.2Z", "visor", { sh: 0.6, tex: 0, ink: 0.6 });
      line(g, "M52.8 -94.6q2.6-.2 3.4 2", "rgba(255,255,255,0.6)", 0.9);
      limb(g, [[45.6, -77.4], [57.4, -66.8], [71.8, -67.6]], [6.6, 5.4, 4.6], "jacket", { sh: 1.6 });
      part(g, circle(73, -67.6, 2.7), "black", { sh: 0.6, tex: 0, ink: 0.6 });
    });
    const drawScooter = (c, m) => {
      const x0 = m.x - 50 * SK, y = LANE1 + m.dy, rr = SR * SK;
      shadowAt(c, m.x, y, 28, 3.6);
      for (const wx of SW) wheelAt(c, spr.wheelS, x0 + wx * SK, y - rr, rr, m.d / rr);
      blit(c, spr.scooter, x0, y + m.bump);
      if (pal.night) { lightUp(c, spr.beamS, x0 + 95.4 * SK, y - 67 * SK + m.bump); lightUp(c, spr.tail, x0 + 1.2 * SK, y - 35.4 * SK + m.bump); }
    };

    // the flower seller (24 px/m): a wooden cart of marigold, jasmine and roses under a striped umbrella, garlands hanging
    // from its rod, pushed by a woman in a sari. Heading right.
    rnd = rng(67);
    const cartParts = (() => {
      const heap = (x0, x1, t, n) => { let s = ""; for (let k = 0; k < n; k++) { const x = between(x0, x1), h = 1 - Math.abs((x - (x0 + x1) / 2) / ((x1 - x0) / 2)); s += `M${r1(x)} ${r1(31 - 0.6 - rnd() * h * (31 - t - 1))}h.1`; } return s; };
      const garland = (x, w) => { let s = ""; for (let k = 0; k <= 8; k++) { const t = k / 8; s += `M${r1(x + t * w)} ${r1(13.4 + Math.sin(t * Math.PI) * 7)}h.1`; } return s; };
      const panels = [27, 32.7, 38.3, 44, 49.7, 55.3, 61], radial = (x, y) => Math.atan2(y - 3, x - 44), blooms = { len: 1.3, wid: 1, jit: 3 };
      return fig([
        ["cart", "M44 31V4", null, "wood", 1.2], ["cart", "M48.4 13.2H62", null, "wood2", 0.8],
        ["cart", garland(48.8, 4.4) + garland(57.4, 4.2), null, "mari", 1.7], ["cart", garland(53.4, 3.8), null, "jas", 1.6],
        ...panels.slice(0, -1).map((x, k) => ["cart", `M44 3L${x} 10.6Q${r1((x + panels[k + 1]) / 2)} 12.2 ${panels[k + 1]} 10.6Z`, `u${(k % 4) + 1}`, null, 0, 0.9, { dir: radial, len: 1.6, jit: 0.15 }]),
        ["cart", `M26.6 10.8Q28.4 3 44 2.6Q59.6 3 61.4 10.8M44 2.6V1.2${panels.slice(1, -1).map((x) => `M44 3L${x} 10.6`).join("")}`, null, "ink", 0.6],
        ["cart", "M27 31Q28 24 35 23.4Q42 24 43.6 31Z", "mari", null, 0, 1.2, blooms], ["cart", "M43 31Q44 26.2 47.6 26Q51.2 26.4 52 31Z", "jas", null, 0, 1, blooms],
        ["cart", "M51.4 31Q53 25 56.8 25Q61 25.4 61.8 31Z", "rose", null, 0, 1.2, blooms],
        ["cart", heap(27.6, 43, 24, 20), null, "bag2", 1.5], ["cart", heap(27.6, 43, 24, 26), null, "mari2", 1.7], ["cart", heap(43.6, 51.4, 26.4, 14), null, "jas2", 1.4],
        ["cart", heap(52, 61.4, 25.4, 12), null, "rose2", 1.5], ["cart", heap(52, 61.4, 25.4, 8), null, "u1", 1.2],
        ["cart", "M29 25.6l-2.4-3.4M41 25l1.8-3.8M60.6 27l2.6-2.8", null, "leaf", 1],
        ["cart", "M25.6 31H62.6V33.6H25.6ZM27 33.6H61V35H27Z", "wood", "ink", 0.6, 0.8, { dir: 0, len: 2.4, jit: 0.1 }], ["cart", "M26 32.2L19.6 28.6", null, "wood", 1.2],
      ]);
    })();
    // she leans into the cart as she pushes: a sari with its pleats and gold border, the pallu over her shoulder and down her
    // back, a green blouse, jasmine round her bun, bangles at her wrist
    const cartSprite = () => person(-21, -61, 34, -4, (g) => { g.scale(1.33, 1.33); g.translate(-40, -45.4); paintFig(g, cartParts, {}, 1); });
    const sellerFrame = (ph, walking) => person(-41, -61, 34, 2, (g) => {
      under(g, spr.cart);
      g.save(); g.scale(1.33, 1.33); g.translate(-40, -45.4);
      for (const wx of [32, 56]) {
        g.beginPath(); g.arc(wx, 40.1, 5.4, 0, 7); g.strokeStyle = mp.wood2; g.lineWidth = 1.4; g.stroke(); g.strokeStyle = mp.ink; g.lineWidth = 0.6; g.stroke();
        g.strokeStyle = mp.ink2; g.lineWidth = 0.45; g.beginPath();
        for (let k = 0; k < 4; k++) { const a = (ph * 9) / 7.2 + (k * Math.PI) / 4; g.moveTo(wx - Math.cos(a) * 5.4, 40.1 - Math.sin(a) * 5.4); g.lineTo(wx + Math.cos(a) * 5.4, 40.1 + Math.sin(a) * 5.4); }
        g.stroke();
      }
      g.restore();
      const bob = walking ? Math.abs(Math.sin(ph)) * 0.5 : 0, sway = walking ? Math.sin(ph) * 0.06 : 0;
      for (const k of [1, -1]) { const o = walking ? Math.sin(ph) * 1.8 * k : k * 1.4; part(g, `M${r1(-34.4 + o)} 0q-.2-1.4 1.2-1.6h2.6q1.4.2 1.4 1.6z`, k > 0 ? "skin" : far("skin"), { sh: 0.3, tex: 0, ink: 0.5 }); }
      g.save(); g.translate(0, bob);
      g.save(); g.translate(-33, -19.6); g.transform(1, 0, sway, 1, 0, 0); g.translate(33, 19.6);
      part(g, "M-35.8 -19.8Q-36.8 -10 -37.8 -1.4H-28Q-28.8 -10 -30.2 -19.8Z", "sari", { sh: 1.4, dir: -1.52, jit: 0.1, len: 2.8 });
      line(g, "M-31.6 -18.8L-30.2 -2M-32.8 -18.6L-32.4 -2M-34.4 -18.6L-35.2 -2", "ink3", 0.5);
      part(g, "M-37.6 -3.4H-28.2L-28 -1.4H-37.8Z", "border", { sh: 0.4, dir: 0, len: 1.6, ink: 0.5 });
      g.restore();
      part(g, "M-35.6 -19.6Q-36.2 -25.8 -34.2 -30.4Q-31.8 -32.4 -29.2 -30.4Q-28.2 -26 -30 -19.6Z", "blouse", { sh: 1.2, dir: -1.5 });
      part(g, "M-30.2 -19.8Q-28.8 -25.6 -30.2 -30.4Q-32.2 -32.6 -35 -30.8Q-37.8 -24.4 -38.4 -13.6L-35.8 -12.8Q-35.2 -19.6 -34.6 -24.8Z", "sari", { sh: 1.6, dir: -1.35, len: 2.6 });
      line(g, "M-35 -30.8Q-37.8 -24.4 -38.4 -13.6", "border", 1);
      part(g, "M-31.6 -32.6h2.2v2.4h-2.2z", "skin", { sh: 0.4, ink: 0.4 });
      part(g, circle(-30.4, -34.4, 2.6), "skin", { sh: 1, len: 1.4 });
      part(g, "M-32.8 -35Q-32.6 -37.4 -30.2 -37.2Q-28 -37 -27.8 -35.4Q-29.4 -36.2 -30.8 -35.6Q-31.6 -34.4 -32.8 -35Z", "hair", { sh: 0.4, len: 1.2 });
      part(g, circle(-33.4, -34.2, 1.6), "hair", { sh: 0.4, len: 1.2 });
      for (let k = 0; k < 5; k++) { const a = 1.9 + k * 0.42; line(g, `M${r1(-33.6 + Math.cos(a) * 1.9)} ${r1(-34 + Math.sin(a) * 1.9)}h.1`, "white", 1); }
      line(g, "M-28.2 -35.2h.1", "rose", 0.9);
      limb(g, [[-31.4, -29.8], [-30.4, -24.6], [-27.2, -22.4]], [2.6, 2.1, 1.8], "skin");
      part(g, taper([[-31.4, -29.8], [-31, -27.2]], 3), "blouse", { sh: 0.6, ink: 0.6 });
      line(g, "M-29 -23.8l.6.9", "u4", 0.6); line(g, "M-28.4 -24.1l.6.9", "u1", 0.6);
      g.restore();
    });

    // a techie walking home on his phone: a checked shirt with its sleeves rolled up, a backpack, a lanyard, white
    // sneakers. Drawn heading right and turned round.
    const walkerFrame = (ph) => person(-12, -41, 12, 2, (g) => {
      g.scale(-1, 1); LX = -1;
      const s = Math.sin(ph), c = Math.cos(ph), bb = Math.abs(s) * 1.1, hip = [0, -19.4 + bb];
      const lift = (v) => 0.08 + 0.6 * Math.max(0, v);
      const leg = (a, bend, colour, shoe) => {
        const knee = [hip[0] + Math.sin(a) * 9.4, hip[1] + Math.cos(a) * 9.4], ankle = [knee[0] + Math.sin(a - bend) * 9.2, knee[1] + Math.cos(a - bend) * 9.2];
        limb(g, [hip, knee, ankle], [4.6, 3.4, 2.6], colour, { sh: 1.1 });
        g.save(); g.translate(ankle[0], ankle[1]); g.rotate((a - bend) * 0.5);
        part(g, "M-1.6 .4Q-1.8 -1.4 0 -1.6L1.6 -1.4Q3.8 -.8 4 .6Q4 1.2 3.2 1.2H-1Q-1.6 1.2 -1.6 .4Z", shoe, { sh: 0.5, tex: 0, ink: 0.6 });
        g.restore();
      };
      leg(-0.42 * s, lift(-c), far("pants"), far("shoe"));
      g.save(); g.translate(0, bb);
      const farArm = [[-0.4, -30], [-1.2 - s * 2.4, -24.8], [-0.6 - s * 4.2, -20.2]];
      limb(g, farArm.slice(0, 2), [2.8, 2.3], far("check"));
      limb(g, farArm.slice(1), [2.1, 1.7], far("skin"));
      g.restore();
      leg(0.42 * s, lift(c), "pants", "shoe");
      g.save(); g.translate(0, bb);
      part(g, "M-8.2 -30.4Q-8.4 -32.2 -6.6 -32.2H-3.4Q-2.4 -32 -2.4 -30.4V-21.6Q-2.4 -20.4 -3.8 -20.4H-6.8Q-8.2 -20.4 -8.2 -21.8Z", "pack", { sh: 1.2, dir: -1.5 });
      const torso = "M-3.4 -18.6Q-3.8 -26 -2.6 -31Q.2 -33 3.2 -31.2Q4.4 -27 3.6 -18.6Z";
      part(g, torso, "check", { sh: 1.6, dir: -1.45 });
      g.save(); g.clip(new Path2D(torso)); line(g, "M-2 -33V-18M0 -33V-18M2 -33V-18M-4 -28.4H5M-4 -25H5M-4 -21.6H5", "rgba(255,255,255,0.4)", 0.45); g.restore();
      line(g, "M-2.4 -31.4Q.6 -32.8 2.4 -30.6L2.8 -24.4", "pack", 1.3);
      line(g, "M-.8 -31.4L.8 -25.4L1.8 -31", "lanyard", 0.6);
      part(g, "M-.2 -25.6h2v2.6h-2z", "white", { sh: 0, tex: 0, ink: 0.3 });
      part(g, taper([[0.8, -32], [1.2, -33.8]], 2), "skin", { sh: 0.4, ink: 0.5 });
      part(g, circle(1.8, -35.6, 2.7), "skin", { sh: 1, len: 1.3 });
      part(g, "M-1 -35.4Q-1.4 -38.8 1.8 -38.6Q4.8 -38.4 4.6 -36.2Q3 -37 1.4 -36.2Q.4 -34.6 -.4 -33.8Z", "hair", { sh: 0.4, len: 1.2 });
      const arm = [[0.6, -30.4], [1.6, -24.8], [5.8, -28.6]];
      limb(g, arm.slice(0, 2), [2.9, 2.4], "check", { sh: 0.9 });
      limb(g, arm.slice(1), [2.1, 1.8], "skin", { sh: 0.6 });
      part(g, "M5 -30.6l2-.2.4 3.8-2 .2z", "phone", { sh: 0, tex: 0, ink: 0.3 });
      part(g, "M5.4 -30.2l1.2-.1.3 3-1.2.1z", "screen", { sh: 0, tex: 0, ink: 0 });
      part(g, ellipse(6, -28.4, 1.1, 0.9), "skin", { sh: 0.3, ink: 0.4 });
      g.restore();
    });

    // the tender-coconut seller: a heap of green coconuts on a handcart, some with their tops trimmed, and a man in a vest,
    // a checked lungi folded to his knees and a towel on his shoulder, chopping one open with his machete
    rnd = rng(71);
    const cocos = Array.from({ length: 16 }, (_, k) => {
      const row = k < 7 ? 0 : k < 12 ? 1 : k < 15 ? 2 : 3, n = [7, 5, 3, 1][row], i = k - [0, 7, 12, 15][row];
      return [4 + (i - (n - 1) / 2) * 5.6 + between(-0.6, 0.6) + 14, -19.4 - row * 4.4, between(2.6, 3.1), between(-2.4, -0.7), rnd() < 0.3];
    });
    // the machete arm, from rest (the blade on the coconut) through the lift to the strike: elbow, hand, the blade's angle
    const CHOP = [[[46.8, -25.4], [42.4, -30.4], 2.75], [[46.4, -27.6], [44.2, -33.6], -2.2], [[47.6, -34.6], [46.6, -41], -1.3], [[46, -31], [41.6, -35.4], -2.9], [[46.6, -25], [42, -29.4], 2.6]];
    const coconut = (g, cx, cy, rr, rot, cut) => {
      part(g, ellipse(cx, cy, rr * 1.1, rr * 0.92, rot), "coco", { sh: rr * 0.42, k: 1, len: 1.5, wid: 0.75, jit: 0.15, dir: round(cx, cy), ink: 0.7 });
      if (cut) part(g, ellipse(cx + Math.cos(rot) * rr * 0.78, cy + Math.sin(rot) * rr * 0.78, rr * 0.36, rr * 0.5, rot), "jas2", { sh: 0.4, tex: 0, ink: 0.5 });
    };
    const heapSprite = () => person(-6, -46, 40, 2, (g) => {
      part(g, "M-2 -17h40v3.4h-40z", "wood", { sh: 1, dir: 0, len: 2.6, jit: 0.1 });
      line(g, "M0 -13.6V-1M36 -13.6V-1", "wood2", 1.6);
      g.beginPath(); g.arc(18, -6.6, 6.2, 0, 7); g.strokeStyle = mp.wood2; g.lineWidth = 1.6; g.stroke(); g.strokeStyle = mp.ink; g.lineWidth = 0.6; g.stroke();
      line(g, "M18 -12.8V-.4M11.8 -6.6H24.2", "ink2", 0.5);
      for (const c of cocos) coconut(g, ...c);
    });
    const cocoFrame = (f) => person(-6, -46, 58, 2, (g) => {
      under(g, spr.heap);
      const [elb, hand, ba] = CHOP[f];
      // his far arm holds a coconut out over the cart
      limb(g, [[50.6, -30.6], [46.8, -24.4], [41.6, -24.2]], [2.6, 2.2, 1.9], far("skin"));
      coconut(g, 39.6, -26.6, 2.9, -2.6, true);
      // bare shins below the folded lungi, chappals
      limb(g, [[48.6, -12], [48, -1.2]], [2.9, 2.2], far("skin"));
      limb(g, [[52, -12], [52.8, -1.2]], [2.9, 2.2], "skin");
      line(g, "M45.6 -.2h4.4M50.8 -.2h4.4", "shoe2", 1.2);
      const lungi = "M44.6 -21.4H54.8L55.6 -10.4H43.8Z";
      part(g, lungi, "lungi", { sh: 1.4, dir: -1.5, len: 2.4 });
      g.save(); g.clip(new Path2D(lungi)); line(g, "M45 -22L44.6 -10M47.4 -22L47.2 -10M49.8 -22V-10M52.2 -22L52.6 -10M54.6 -22L55 -10M43 -18.6H57M43 -15H57M43 -11.8H57", "rgba(255,255,255,0.35)", 0.6); g.restore();
      line(g, "M45 -21.2Q49.6 -19.6 54.6 -21.2", "ink2", 0.6);
      part(g, "M44.4 -21.2Q43.4 -25.4 44.8 -29Q47 -32.2 50.2 -32Q53.6 -31.6 54.2 -28.6Q54.8 -24.6 54.6 -21.2Z", "vest", { sh: 1.6, dir: -1.5 });
      part(g, "M47.6 -33h2.6v2.4h-2.6z", "skin", { sh: 0.4, ink: 0.4 });
      part(g, circle(48.4, -35.4, 2.7), "skin", { sh: 1, len: 1.3 });
      part(g, "M45.8 -36.2Q45.8 -38.8 48.6 -38.8Q51.4 -38.6 51.2 -35.6Q50.4 -36.8 48.6 -36.8Q46.8 -36.6 45.8 -36.2Z", "hair", { sh: 0.4, len: 1.2 });
      line(g, "M45.9 -34.5q.8.6 1.8.2", "hair", 0.8);
      part(g, "M51.4 -32.2Q54.6 -31.6 54.8 -28L55 -22.6H53.2L52.8 -27.6Q52.6 -30 50.6 -31Z", "white", { sh: 0.8, dir: -1.5, len: 1.8 });
      line(g, "M53.4 -25.6h1.6M53.2 -24.2h1.8", "u1", 0.5);
      // his machete arm
      limb(g, [[49.4, -30.4], elb, hand], [2.9, 2.4, 2], "skin");
      g.save(); g.translate(hand[0], hand[1]); g.rotate(ba);
      part(g, "M1 -.8L8.6 -1.4Q9.8 0 8.6 1.2L1 1Z", "blade", { sh: 0.5, tex: 0, ink: 0.6 });
      part(g, "M-1.2 -.7H1.4V.7H-1.2Z", "wood2", { sh: 0, tex: 0, ink: 0.4 });
      g.restore();
      part(g, ellipse(hand[0], hand[1], 1.3, 1.1), "skin", { sh: 0.3, ink: 0.5 });
    });

    // a Hallikar cow (Karnataka's grey-white breed) resting on the road (26 px/m): hump, folded legs, long horns painted
    // for Sankranti, a marigold garland. She chews, looks about and swishes her tail.
    const cowParts = fig([
      ["", "M30 0Q32.4 -5.6 29.4 -10.4Q27.4 -12.8 22 -12.2Q15.4 -11.6 11.4 -12.6Q9.6 -16.2 6.6 -15.4Q4 -14.4 3.6 -11.2L3 -4Q3.4 -.8 6.4 0Z", "cow", "ink", 0.7, 2.2],
      ["", "M9.6 -13.6Q12 -11.4 11.4 -7.6M24 -11.4Q27.6 -9 27 -4.4M6.4 -14Q8 -12 7.6 -9", null, "cow2", 1.2],
      ["", "M5 -.4Q9 -3.4 14.4 -1.2L14 0M21.6 -2.6Q26 -4.6 30 -1.6", "cow", "ink", 0.7, 0.8],
      ["", "M13.6 -.8l1.6.2M29.4 -1.4l1.2.6", null, "ink", 1.2],
      ["head", "M4.6 -13.4Q1 -13.8 -1.4 -12.8L-6 -9.8Q-8.4 -8.4 -7.4 -6.6Q-6.4 -5.4 -4.4 -6.2L-.6 -7.8Q2.6 -7.4 4.4 -8.8Z", "cow", "ink", 0.7, 1.4],
      ["head", "M-.6 -7.8Q1.4 -4.4 4.2 -4.2", null, "ink2", 0.6],
      ["head", "M-6.4 -8.6a1.2 1 0 1 0 .1 0", "cow2", null, 0, 0],
      ["head", "M-2.2 -12.8Q-3.6 -16.6 -.6 -18.4", null, "horn", 1.4], ["head", "M-.4 -13.2Q.2 -16.6 3.4 -17.4", null, "horn2", 1.4],
      ["head", "M-3.6 -10.6h.1", null, "ink", 1.3],
      ["head", "M3 -13.2Q1.2 -9.6 3.4 -5.4", null, "mari", 1.7], ["head", "M3 -13.2Q1.2 -9.6 3.4 -5.4", null, "rgba(255,255,255,0.45)", 0.5],
      ["head", "M-1 -12.4q2.8-.8 4.4 1q-2.6 1.2-4.4-1z", "cow2", "ink", 0.5, 0.5],
    ]);
    const CK = 1.6;
    const cowSprite = (group) => sprite(-16, -32, 58, 2, (g) => { g.scale(CK, CK); paintFig(g, cowParts.filter((q) => (q.g === "head") === (group === "head"))); });
    const drawCow = (c, t) => {
      const look = Math.sin(t * 0.23) > 0.6 ? Math.min(1, (Math.sin(t * 0.23) - 0.6) * 5) * 0.22 : 0, chew = Math.sin(t * 5) * 0.025;
      const swish = Math.sin(t * 1.3) * 0.5 + Math.sin(t * 3.1) * 0.15;
      const y = 282, tx = COW + (30.6 + Math.cos(swish + 1.1) * 7) * CK, ty = y + (-8 + Math.sin(swish + 1.1) * 7) * CK;
      shadowAt(c, COW + 18 * CK, y, 32, 3.6);
      c.strokeStyle = mp.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(COW + 30 * CK, y - 8 * CK); c.quadraticCurveTo(COW + 33.4 * CK, y - 5 * CK, tx, ty); c.stroke();
      c.fillStyle = mp.ink2; c.beginPath(); c.arc(tx, ty, 1.6, 0, 7); c.fill();
      blit(c, spr.cowBody, COW, y);
      c.save(); c.translate(COW + 4 * CK, y - 11 * CK); c.rotate(-look + chew); c.translate(-(COW + 4 * CK), -(y - 11 * CK));
      blit(c, spr.cowHead, COW, y);
      c.restore();
    };
    // a street dog curled up asleep on the footpath, breathing
    const dogSprite = () => sprite(-2, -13, 24, 2, (g) => {
      g.scale(1.6, 1.6);
      part(g, "M0 0Q-1.2 -5.4 4.4 -6.6Q9.6 -7.4 12.4 -4Q13.8 -1.6 12.6 0Z", "dog", { sh: 1.4, ink: 0.6, dir: round(6, -1), len: 1.6 });
      line(g, "M6 -6.2Q9.6 -5.6 11.4 -3.6", "dog2", 1);
      part(g, ellipse(3.8, -2.8, 2.8, 2.5), "dog", { sh: 0.9, ink: 0.6, len: 1.4 });
      part(g, "M3.4 -4.8L3.2 -7.4L5.4 -5.6Z", "dog2", { sh: 0, tex: 0, ink: 0.5 });
      line(g, "M1.8 -2.6Q2.6 -2.2 3.4 -2.6M12.4 -.8Q13 1 8 .6", "ink", 0.6);
    });
    const drawDog = (c, t) => {
      shadowAt(c, 1890, WALK, 12, 2.4);
      c.save(); c.translate(1880, WALK); c.scale(1, 1 + Math.sin(t * 1.6) * 0.035); c.translate(-1880, -WALK);
      blit(c, spr.dog, 1880, WALK);
      c.restore();
    };
    // black kites wheeling high over the city by day
    const drawKite = (c, x, y, flap) => {
      c.strokeStyle = mp.kite; c.lineWidth = 1.4; c.beginPath();
      c.moveTo(x - 7, y + flap * 0.5); c.quadraticCurveTo(x - 3.4, y - 2.6 - flap, x, y); c.quadraticCurveTo(x + 3.4, y - 2.6 - flap, x + 7, y + flap * 0.5);
      c.stroke();
    };
    const buildSprites = () => {
      spr.metro = metroSprite();
      spr.auto = autoSprite();
      spr.scooter = scooterSprite();
      spr.wheelA = wheelSprite(AR * AK);
      spr.wheelS = wheelSprite(SR * SK);
      spr.beamA = beamSprite(31.4 * AK, 150, "255,196,110");
      spr.beamS = beamSprite(67 * SK, 150, "255,222,165");
      spr.beamM = beamSprite(16, 90, "255,240,214", false);
      spr.tail = glowSprite(6, "255,70,50");
      spr.cart = cartSprite();
      spr.heap = heapSprite();
      spr.seller = Array.from({ length: 8 }, (_, k) => sellerFrame((k / 8) * Math.PI * 2, true));
      spr.sellerStill = sellerFrame(0, false);
      spr.walker = Array.from({ length: 8 }, (_, k) => walkerFrame((k / 8) * Math.PI * 2));
      spr.coco = [0, 1, 2, 3, 4].map(cocoFrame);
      spr.cowBody = cowSprite("body");
      spr.cowHead = cowSprite("head");
      spr.dog = dogSprite();
    };

    // ---------- the view: scale to the strip's height, centred on Vidhana Soudha ----------
    let dpr = 1, s = 1, oy = 0, wx0 = 0, wx1 = 0, S = 1, OY = 0;
    const worldT = (c) => c.setTransform(S, 0, 0, S, -wx0 * S, OY);
    const compose = (Lr, rect) => {
      const c = Lr.comp.getContext("2d");
      c.setTransform(1, 0, 0, 1, 0, 0);
      let x0 = wx0 - 20, x1 = wx1 + 20, y0 = -20, y1 = H + 20;
      c.save();
      if (rect) {
        [x0, y0, x1, y1] = rect;
        const px0 = Math.max(0, Math.floor((x0 - wx0) * S)), px1 = Math.min(view.width, Math.ceil((x1 - wx0) * S));
        const py0 = Math.max(0, Math.floor(y0 * S + OY)), py1 = Math.min(view.height, Math.ceil(y1 * S + OY));
        if (px1 <= px0 || py1 <= py0) { c.restore(); return; }
        c.clearRect(px0, py0, px1 - px0, py1 - py0);
        c.drawImage(Lr.base, px0, py0, px1 - px0, py1 - py0, px0, py0, px1 - px0, py1 - py0);
        c.beginPath(); c.rect(px0, py0, px1 - px0, py1 - py0); c.clip();
      } else {
        c.clearRect(0, 0, view.width, view.height);
        c.drawImage(Lr.base, 0, 0);
      }
      worldT(c);
      c.lineCap = c.lineJoin = "round";
      for (const set of Lr.sets) { const list = []; query(set, x0, y0, x1, y1, (d) => list.push(d)); strokeMarks(c, set, list); }
      if (Lr.over) Lr.over(c);
      c.restore();
    };
    const repaint = () => {
      orb = orbSprite();
      for (const Lr of layers) {
        for (const c of [Lr.base, Lr.comp]) { c.width = view.width; c.height = view.height; }
        const b = Lr.base.getContext("2d");
        worldT(b);
        b.lineCap = b.lineJoin = "round";
        if (Lr === sky) {
          const g = b.createLinearGradient(0, 0, 0, SKY);
          g.addColorStop(0, pal.skyTop); g.addColorStop(1, pal.skyLow);
          pal.skyBase = g;
        }
        render(b, Lr.draw.list);
        compose(Lr, null);
      }
      buildSprites();
    };
    let shape = "";
    const size = () => {
      const w = strip.clientWidth, h = strip.clientHeight;
      if (!w || !h) return;
      // sharp on retina screens, but no layer bigger than 2.5 million pixels (seven layers on a wide 4K screen add up)
      dpr = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(2.5e6 / (w * h)));
      if (shape === `${w} ${h} ${dpr}`) return;
      shape = `${w} ${h} ${dpr}`;
      s = Math.max(h / H, w / (X1 - X0 - 40));
      oy = h - H * s;
      wx0 = MID - w / 2 / s; wx1 = MID + w / 2 / s;
      S = s * dpr; OY = oy * dpr;
      view.width = Math.round(w * dpr); view.height = Math.round(h * dpr);
      repaint();
      draw();
    };

    // ---------- the pointer paints: its own stroke, which fades into the wind, and nearby marks nudged aside that flow
    // back to where they were within about three seconds ----------
    const HOLD = 0.6, trail = [];
    let trailGap = 0;
    const grow = (Lr, d) => {
      const q = 5 + d.l / 2 + 4, r = Lr.dirty;
      if (!r) Lr.dirty = [d.ox - q, d.oy - q, d.ox + q, d.oy + q];
      else { r[0] = Math.min(r[0], d.ox - q); r[1] = Math.min(r[1], d.oy - q); r[2] = Math.max(r[2], d.ox + q); r[3] = Math.max(r[3], d.oy + q); }
    };
    const stir = (ax, ay, bx, by) => {
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
      if (len < 0.4) return;
      const now = clock(), ux = dx / len, uy = dy / len, dir = Math.atan2(dy, dx), RAD = 26;
      for (const Lr of layers) for (const set of Lr.sets) {
        query(set, Math.min(ax, bx) - RAD, Math.min(ay, by) - RAD, Math.max(ax, bx) + RAD, Math.max(ay, by) + RAD, (d) => {
          const along = Math.max(0, Math.min(len, (d.ox - ax) * ux + (d.oy - ay) * uy)), ex = d.ox - ax - ux * along, ey = d.oy - ay - uy * along;
          const dist = Math.hypot(ex, ey);
          if (dist >= RAD) return;
          const w = (1 - dist / RAD) ** 2, nx = dist > 0.01 ? ex / dist : -uy, ny = dist > 0.01 ? ey / dist : ux;
          const want = dir + Math.PI * Math.round((d.oa - dir) / Math.PI) - d.oa;
          d.tx += (nx * 3.4 + ux * 1.2 - d.tx) * w;
          d.ty += (ny * 3.4 + uy * 1.2 - d.ty) * w;
          d.ta += (Math.max(-0.6, Math.min(0.6, want)) - d.ta) * w;
          d.t = now;
          set.active.add(d);
          grow(Lr, d);
        });
      }
      // the stroke itself: a broad brush of three rows of marks along the path, in the sky's (or the road's) lighter colours
      const inSky = by < SKY - 6, onRoad = by > KERB + 9;
      if (!inSky && !onRoad) return;
      for (trailGap += len; trailGap > 5; trailGap -= 5) {
        const t = 1 - trailGap / len, px = ax + dx * Math.max(0, t), py = ay + dy * Math.max(0, t);
        for (const side of [-3, 0, 3]) {
          const x = px - uy * side + between(-0.8, 0.8), y = py + ux * side + between(-0.8, 0.8), f = inSky ? skyFlow(x, y) : roadFlow(x, y);
          trail.push({ x, y, a: dir + between(-0.12, 0.12), fa: Math.atan2(f[1], f[0]), l: between(11, 15), w: inSky ? 3.4 : 3.6, sky: inSky,
            c: inSky ? pal.sky[pick(pal.trailSky)] : pal.road[pick(pal.trailRoad)], born: now });
        }
      }
      if (trail.length > 480) trail.splice(0, trail.length - 480);
    };
    const settle = (dt) => {
      let busy = false;
      const now = clock(), ease = 1 - Math.exp(-dt / 0.12), relax = Math.exp(-dt / 0.55);
      for (const Lr of layers) for (const set of Lr.sets) for (const d of set.active) {
        const resting = now - d.t > HOLD;
        if (resting) { d.tx *= relax; d.ty *= relax; d.ta *= relax; }
        d.dx += (d.tx - d.dx) * ease; d.dy += (d.ty - d.dy) * ease; d.da += (d.ta - d.da) * ease;
        if (resting && Math.abs(d.dx) + Math.abs(d.dy) < 0.04 && Math.abs(d.da) < 0.004) {
          d.dx = d.dy = d.da = d.tx = d.ty = d.ta = 0;
          set.active.delete(d);
        } else busy = true;
        d.x = d.ox + d.dx; d.y = d.oy + d.dy; d.a = d.oa + d.da;
        grow(Lr, d);
      }
      for (const Lr of layers) if (Lr.dirty) { compose(Lr, Lr.dirty); Lr.dirty = null; }
      while (trail.length && now - trail[0].born > 3) trail.shift();
      return busy || trail.length > 0;
    };
    const drawTrail = (c, inSky) => {
      const now = clock();
      c.lineCap = "round";
      for (const m of trail) {
        if (m.sky !== inSky) continue;
        const age = now - m.born, fade = age > 2.1 ? Math.max(0, 1 - (age - 2.1) / 0.9) : 1;
        if (fade <= 0) continue;
        const grown = Math.min(1, age / 0.14), drift = age * 5, turn = Math.min(1, age / 2.6);
        const da = m.fa + Math.PI * Math.round((m.a - m.fa) / Math.PI) - m.a, a = m.a + da * turn;
        const x = m.x + Math.cos(m.fa) * drift, y = m.y + Math.sin(m.fa) * drift, l = m.l * grown * (0.5 + 0.5 * fade);
        c.globalAlpha = fade; c.strokeStyle = m.c; c.lineWidth = m.w;
        c.beginPath(); c.moveTo(x - (Math.cos(a) * l) / 2, y - (Math.sin(a) * l) / 2); c.lineTo(x + (Math.cos(a) * l) / 2, y + (Math.sin(a) * l) / 2); c.stroke();
      }
      c.globalAlpha = 1;
    };
    let last = null;
    const pointAt = (cx, cy) => {
      const r = view.getBoundingClientRect();
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
      return [wx0 + (cx - r.left) / s, (cy - r.top - oy) / s];
    };
    const move = (cx, cy) => {
      if (reduce) return;
      const p = pointAt(cx, cy);
      if (p && last) { stir(last[0], last[1], p[0], p[1]); wake(); }
      last = p;
    };
    addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") move(e.clientX, e.clientY); }, { passive: true });
    addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    addEventListener("touchend", () => { last = null; }, { passive: true });
    document.addEventListener("mouseleave", () => { last = null; });

    // ---------- life on the street ----------
    let T = 0;
    const span = () => [wx0 - 120, wx1 + 120];
    const STOP = (STATION[0] + STATION[1]) / 2 - TRAIN / 2, BRAKE = 9, CRUISE = 100;
    const metro = { x: STOP - 760, v: CRUISE, state: "run", wait: 0, open: 0 };
    const auto = { x: MID + 260, v: 110, vt: 110, d: 0, bump: 0, next: 2, wait: 0, puff: 0 };
    const scooter = { x: MID - 520, v: 130, vt: 130, d: 0, bump: 0, dy: 0, next: 3, wait: 0 };
    const seller = { x: MID - 330, d: 0, walking: true, next: 9 };
    const walker = { x: MID + 140, d: 0, wait: 0 };
    const puffs = [];
    const drive = (m, dt, cruise, dir) => {
      if (m.wait > 0) { m.wait -= dt; if (m.wait <= 0) { const [a, b] = span(); m.x = dir > 0 ? a : b; m.v = cruise; } return false; }
      if ((m.next -= dt) <= 0) { m.next = between(2, 5); m.vt = cruise * between(0.65, 1.15); }
      m.v += (m.vt - m.v) * Math.min(1, dt * 1.2);
      m.x += m.v * dir * dt; m.d += m.v * dt;
      const [a, b] = span();
      if ((dir > 0 && m.x > b) || (dir < 0 && m.x < a)) m.wait = between(1.5, 6);
      return true;
    };
    const tick = (dt) => {
      // metro: cruise in, brake to a stop at the station, doors open, wait, close, pull away, gone for a while
      if (metro.state === "run") {
        const left = STOP - metro.x;
        metro.v = left > 0 ? Math.min(CRUISE, Math.sqrt(2 * BRAKE * left) + 1.5) : 0;
        metro.x = Math.min(STOP, metro.x + metro.v * dt);
        if (metro.x >= STOP - 0.05) { metro.state = "dwell"; metro.wait = 8; }
      } else if (metro.state === "dwell") {
        metro.wait -= dt;
        metro.open = Math.max(0, Math.min(1, (8 - metro.wait - 0.8) / 1.2, (metro.wait - 0.8) / 1.2));
        if (metro.wait <= 0) { metro.state = "leave"; metro.v = 0; metro.open = 0; }
      } else if (metro.state === "leave") {
        metro.v = Math.min(CRUISE, metro.v + BRAKE * dt);
        metro.x += metro.v * dt;
        if (metro.x > span()[1]) { metro.state = "gone"; metro.wait = between(3, 8); }
      } else if ((metro.wait -= dt) <= 0) { metro.state = "run"; metro.x = Math.min(span()[0] - TRAIN, STOP - 700); }
      // auto: traffic speed that comes and goes, a bumpy ride, puffs of exhaust
      if (drive(auto, dt, 115, -1)) {
        auto.bump = Math.sin(T * 17) * 0.35 + (Math.sin(T * 3.3) > 0.97 ? -0.6 : 0);
        if ((auto.puff -= dt) <= 0) { auto.puff = between(0.25, 0.5); puffs.push({ x: auto.x + 36, y: LANE2 - 6, t: 0, s: between(0.8, 1.2) }); }
      }
      // scooter: slows and swerves round the cow
      const nearCow = Math.abs(scooter.x - COW - 20);
      if (nearCow < 170) scooter.vt = Math.min(scooter.vt, 80);
      if (drive(scooter, dt, 130, 1)) {
        scooter.dy += ((nearCow < 110 ? 9 : 0) - scooter.dy) * Math.min(1, dt * 2.4);
        scooter.bump = Math.sin(T * 13) * 0.25;
      }
      // the flower seller walks, and stops now and then
      if ((seller.next -= dt) <= 0) { seller.walking = !seller.walking; seller.next = seller.walking ? between(8, 18) : between(3, 6); }
      if (seller.walking) { seller.x += 19 * dt; seller.d += 19 * dt; }
      if (seller.x > span()[1] + 40) seller.x = span()[0] - 60;
      // the techie walks on, eyes on his phone
      if (walker.wait > 0) { if ((walker.wait -= dt) <= 0) walker.x = span()[1]; }
      else { walker.x -= 27 * dt; walker.d += 27 * dt; if (walker.x < span()[0]) walker.wait = between(4, 10); }
      for (let k = puffs.length - 1; k >= 0; k--) { const p = puffs[k]; p.t += dt; p.y -= dt * 7; p.x += dt * 8; if (p.t > 1.6) puffs.splice(k, 1); }
    };

    const frameOf = (d, stride) => Math.floor((((d / stride) % 1) + 1) % 1 * 8) % 8;
    const kites = [[1260, 78, 46, 0.32, 0], [2420, 62, 60, -0.24, 2]];
    const draw = () => {
      if (!view.width || !spr.auto) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, view.width, view.height);
      ctx.drawImage(sky.comp, 0, 0);
      worldT(ctx);
      ctx.lineCap = ctx.lineJoin = "round";
      drawTrail(ctx, true);
      if (pal.night) for (let k = 0; k < stars.length; k++) {
        const [x, y] = stars[k], tw = 1 + Math.sin(T * (1.3 + (k % 4) * 0.4) + k) * 0.2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5 * tw);
        g.addColorStop(0, "rgba(255,248,210,1)"); g.addColorStop(0.45, "rgba(255,236,160,0.7)"); g.addColorStop(1, "rgba(255,226,140,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 5 * tw, 0, 7); ctx.fill();
      } else for (const [cx, cy, rr, w, ph] of kites) {
        const a = T * w + ph;
        drawKite(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.4, Math.sin(T * 6 + ph) > 0.7 ? 1.4 : 0);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(backLayer.comp, 0, 0);
      worldT(ctx);
      if (metro.state !== "gone") drawMetro(ctx, metro.x, metro.open);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(frontLayer.comp, 0, 0);
      worldT(ctx);
      ctx.lineCap = ctx.lineJoin = "round";
      drawTrail(ctx, false);
      shadowAt(ctx, 1534, WALK, 36, 2.8);
      const cp = (T % 1.8) / 1.8; // rest with the blade on the coconut, lift, strike
      blit(ctx, spr.coco[cp < 0.5 ? 0 : cp < 0.62 ? 1 : cp < 0.78 ? 2 : cp < 0.86 ? 3 : cp < 0.92 ? 4 : 0], 1508, WALK);
      drawDog(ctx, T);
      if (walker.wait <= 0) { shadowAt(ctx, walker.x, WALK, 9, 2); blit(ctx, spr.walker[frameOf(walker.d, 7 * 2 * Math.PI)], walker.x, WALK); }
      shadowAt(ctx, seller.x + 6, WALK, 40, 2.8);
      blit(ctx, seller.walking ? spr.seller[frameOf(seller.d, 9 * 2 * Math.PI)] : spr.sellerStill, seller.x, WALK);
      drawCow(ctx, T);
      if (scooter.wait <= 0) drawScooter(ctx, scooter);
      for (const p of puffs) {
        const k = p.t / 1.6, rr = (2 + k * 5) * p.s;
        ctx.strokeStyle = mp.puff; ctx.globalAlpha = 0.7 * (1 - k); ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let a = 0; a < 9; a += 0.4) { const q = (a / 9) * rr; ctx[a ? "lineTo" : "moveTo"](p.x + Math.cos(a + p.t * 2) * q, p.y + Math.sin(a + p.t * 2) * q); }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (auto.wait <= 0) drawAuto(ctx, auto);
      if (fade) {
        const k = 1 - (performance.now() - fade.t) / 700;
        if (k <= 0) fade = null;
        else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(fade.c, 0, 0); ctx.globalAlpha = 1; }
      }
    };

    // ---------- the loop: runs while the strip is on screen (or a stroke or theme change is settling) ----------
    let raf = 0, onScreen = true, then = 0, fade = null;
    const loop = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - then) / 1000 || 0);
      then = now;
      if (!reduce) { T += dt; tick(dt); }
      const busy = settle(dt);
      draw();
      if ((onScreen && !reduce && !document.hidden) || busy || fade) raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf) { then = performance.now(); raf = requestAnimationFrame(loop); } };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) wake(); }).observe(strip);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
    let resizing = 0;
    new ResizeObserver(() => { cancelAnimationFrame(resizing); resizing = requestAnimationFrame(size); }).observe(strip);
    new MutationObserver(() => {
      if (!view.width) return;
      if (!reduce) { const c = document.createElement("canvas"); c.width = view.width; c.height = view.height; c.getContext("2d").drawImage(view, 0, 0); fade = { c, t: performance.now() }; }
      setPalette();
      repaint();
      wake();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    if (reduce) { // a still scene, everyone in view
      metro.x = STOP; metro.state = "dwell"; metro.wait = 4;
    }
    size();
    strip.classList.add("is-ready");
    wake();
  }
})();
