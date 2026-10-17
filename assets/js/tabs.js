// tabs.js — accessible tabs shared by the case studies: [data-tabs] > [role=tablist] > [role=tab] + [role=tabpanel].
// Arrow keys, Home and End move between tabs; panels fade in; revealed content inside a newly shown panel is made visible.

(() => {
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-tabs]").forEach((root) => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const select = (i, focus) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    const panel = panels[i];
    panel.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    if (!reduce) { panel.classList.remove("is-entering"); void panel.offsetWidth; panel.classList.add("is-entering"); }
    window.dispatchEvent(new Event("resize")); // the carousel in the panel re-measures
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      select((to + tabs.length) % tabs.length, true);
    });
  });
  root.classList.add("is-ready");
  select(0);
});
})();
