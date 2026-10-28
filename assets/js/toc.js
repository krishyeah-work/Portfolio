// toc.js — highlights the case-study contents link for the section in view, and moves "All work" into the
// contents list once you scroll (wide screens only; below 1080px there is no contents list). Optional enhancement.
const tocLinks = document.querySelectorAll(".toc a[href^='#']");
if (tocLinks.length && "IntersectionObserver" in window) {
  const byId = new Map([...tocLinks].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}

// "All work". On wide screens (1640px+) the contents sit in the left margin: as you scroll, "All work" flies from the
// top of the page into the margin and the sections slide in under it; scrolling back to the top flies it home.
// Between 1080 and 1640px the link slides out to the left and reappears at the top of the in-column contents.
// Blocks wider than the column ([data-wide], such as the live rate table) would run under the margin contents, so while
// one is alongside, the contents slide further left to make room, and back after it; they hide only if no margin is left.
const crumb = document.querySelector(".cs-hero .crumb");
const toc = document.querySelector(".toc");
const back = toc?.querySelector(".toc__back");
if (crumb && toc && back) {
  const wide = matchMedia("(min-width: 1080px)");
  const rail = matchMedia("(min-width: 1640px)");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const article = document.querySelector(".cs-layout > article");
  const EASE = "cubic-bezier(0.65, 0, 0.25, 1)";
  toc.querySelectorAll("ol li").forEach((li, i) => li.style.setProperty("--i", i));
  let away = null, flight = 0;

  const reset = () => {
    flight++;
    [back, crumb].forEach((el) => { el.style.transition = ""; el.style.transform = ""; el.style.opacity = ""; });
    toc.classList.remove("is-undocking");
  };
  const delta = (from, to) => {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    return `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
  };

  // top of the page → margin
  const dock = () => {
    const id = ++flight;
    back.style.transition = "none";
    back.style.transform = "none";
    toc.classList.remove("is-undocking");
    toc.classList.add("has-back");
    back.style.transform = delta(crumb, back);
    back.style.opacity = "1";
    crumb.style.transition = "none";
    crumb.classList.add("is-away");
    void back.offsetWidth;
    back.style.transition = `transform 0.65s ${EASE}`;
    back.style.transform = "";
    setTimeout(() => { if (id === flight) { back.style.transition = ""; back.style.opacity = ""; crumb.style.transition = ""; } }, 700);
  };
  // margin → top of the page
  const undock = () => {
    const id = ++flight;
    crumb.style.transition = "none";
    crumb.classList.remove("is-away");
    crumb.style.opacity = "0";
    toc.classList.add("is-undocking");
    back.style.transition = `transform 0.55s ${EASE}`;
    back.style.opacity = "1";
    back.style.transform = delta(crumb, back);
    setTimeout(() => {
      if (id !== flight) return;
      crumb.style.opacity = "";
      toc.classList.remove("has-back", "is-undocking");
      back.style.transition = "none";
      back.style.transform = "";
      back.style.opacity = "";
      void back.offsetWidth;
      back.style.transition = "";
      crumb.style.transition = "";
    }, 560);
  };

  const wides = [...document.querySelectorAll("[data-wide]")];
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; // smaller on laptops (base.css)
  const GAP = 40, EDGE = 16;
  let TOP = 104; // the rail's top: 6.5rem in case-study.css
  const makeRoom = () => {
    let shift = 0, cramped = false;
    if (rail.matches) {
      const home = document.documentElement.clientWidth / 2 - 49.75 * rem(); // the contents' usual left edge (see case-study.css)
      const bottom = TOP + toc.offsetHeight;
      wides.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < TOP - GAP || r.top > bottom + GAP) return; // not alongside
        const left = r.left - GAP - toc.offsetWidth;
        if (left < EDGE) cramped = true;
        else shift = Math.min(shift, left - home);
      });
    }
    toc.style.setProperty("--shift", `${cramped ? 0 : Math.round(shift)}px`);
    toc.classList.toggle("is-cramped", cramped);
  };

  const update = () => {
    const next = wide.matches && window.scrollY > 60;
    TOP = 6.5 * rem();
    if (rail.matches && article) toc.classList.toggle("is-past", article.getBoundingClientRect().bottom < TOP + toc.offsetHeight + 40);
    makeRoom();
    if (next === away) return;
    const first = away === null;
    away = next;
    if (rail.matches && !first && !still.matches) { (away ? dock : undock)(); return; }
    reset();
    crumb.classList.toggle("is-away", away);
    toc.classList.toggle("has-back", away);
  };
  addEventListener("scroll", update, { passive: true });
  const onResize = () => { reset(); away = null; update(); };
  wide.addEventListener?.("change", onResize);
  rail.addEventListener?.("change", onResize);
  update();
}
