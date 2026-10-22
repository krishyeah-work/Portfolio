// peek.js — "Also check out" at the end of a case study. On desktop, hovering a project title shows a small live
// preview of that project's thumbnail beside the pointer; it trails the pointer a little and fades when you leave.
// Touch screens and narrow windows get the plain links (the preview is hidden in CSS there too).

(() => {
  const fine = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1080px)");
  const GAP = 22; // between the pointer and the preview

  document.querySelectorAll(".also__item").forEach((item) => {
    const peek = item.querySelector(".peek");
    if (!peek) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;

    // above and to the right of the pointer, kept inside the window
    const aim = (e) => {
      const w = peek.offsetWidth, h = peek.offsetHeight;
      tx = Math.min(window.innerWidth - w - 16, e.clientX + GAP);
      ty = e.clientY - h - GAP < 72 ? e.clientY + GAP : e.clientY - h - GAP;
    };
    const follow = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      peek.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(follow);
    };

    item.addEventListener("pointerenter", (e) => {
      if (!fine.matches || e.pointerType !== "mouse") return;
      on = true;
      aim(e);
      x = tx; y = ty + 10; // starts just below where it settles, then rises into place
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(follow);
      peek.classList.add("is-on");
    });
    item.addEventListener("pointermove", (e) => { if (on) aim(e); });
    item.addEventListener("pointerleave", () => { on = false; peek.classList.remove("is-on"); });
  });
})();
