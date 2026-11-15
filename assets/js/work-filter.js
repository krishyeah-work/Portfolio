// work-filter.js — the tabs on the Work page: All, At Intuit, Experiments. A tab shows only that group's rows
// (each <li data-group>). The motion, in order: the rows that don't belong fade up and out; the rows that stay glide to
// their new places; the new rows rise in one after another; the list's height eases to fit. A soft pill slides to the tab
// that's on. The choice goes in the address (#intuit, #experiments) so a link can open a tab.
// Without scripts every row shows; with reduced motion the list simply changes.

(() => {
  const tabs = [...document.querySelectorAll("[data-filter]")];
  const list = document.querySelector("[data-filter-list]");
  if (!tabs.length || !list) return;
  const wrap = list.closest(".wlist"), bar = tabs[0].parentElement, ink = bar.querySelector(".wtabs__ink");
  const rows = [...list.children];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = "all", busy = 0;

  const placeInk = () => {
    const on = tabs.find((t) => t.dataset.filter === current);
    if (!ink || !on) return;
    ink.style.width = on.offsetWidth + "px"; ink.style.height = on.offsetHeight + "px";
    ink.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
    bar.classList.add("has-ink");
  };
  const fits = (li, f) => f === "all" || li.dataset.group === f;
  const announce = () => dispatchEvent(new Event("worklist:change"));

  const show = (f, { instant = false } = {}) => {
    if (f === current && !instant) return;
    current = f;
    tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.filter === f)));
    wrap.dataset.show = f;
    placeInk();
    if (instant || reduce) { rows.forEach((li) => { li.hidden = !fits(li, f); }); announce(); return; }

    const run = ++busy;
    const leaving = rows.filter((li) => !li.hidden && !fits(li, f));
    const staying = rows.filter((li) => !li.hidden && fits(li, f));
    const entering = rows.filter((li) => li.hidden && fits(li, f));
    const h0 = wrap.offsetHeight;
    wrap.style.height = h0 + "px";
    leaving.forEach((li) => li.classList.add("is-leaving"));
    setTimeout(() => {
      if (run !== busy) return;
      // where the staying rows are now, so they can glide from there (FLIP)
      const before = new Map(staying.map((li) => [li, li.getBoundingClientRect().top]));
      leaving.forEach((li) => { li.hidden = true; li.classList.remove("is-leaving"); });
      entering.forEach((li) => { li.hidden = false; li.classList.add("is-entering"); });
      staying.forEach((li) => { const dy = before.get(li) - li.getBoundingClientRect().top; if (dy) { li.style.transition = "none"; li.style.transform = `translateY(${dy}px)`; } });
      const h1 = list.offsetHeight;
      announce();
      requestAnimationFrame(() => {
        wrap.style.height = h1 + "px";
        staying.forEach((li) => { li.style.transition = ""; li.style.transform = ""; });
        entering.forEach((li, i) => setTimeout(() => { if (run === busy) li.classList.remove("is-entering"); }, 60 + i * 55));
      });
      setTimeout(() => { if (run === busy) wrap.style.height = ""; }, 600);
    }, leaving.length ? 200 : 0);
  };

  tabs.forEach((t) => t.addEventListener("click", () => {
    show(t.dataset.filter);
    const hash = t.dataset.filter === "all" ? "" : "#" + t.dataset.filter;
    history.replaceState(null, "", location.pathname + hash);
  }));
  const fromHash = () => { const h = location.hash.slice(1); return tabs.some((t) => t.dataset.filter === h) ? h : "all"; };
  show(fromHash(), { instant: true });
  addEventListener("hashchange", () => show(fromHash()));
  addEventListener("resize", placeInk, { passive: true });
  document.fonts?.ready.then(placeInk);
})();
