// carousel.js — scroll-snap carousel: swipe, arrow keys, a row of slim pills (one per image), and a small pager:
// one rounded control holding ‹ 1 / 5 ›, right beside the pills. Markup: [data-carousel] > .carousel__track >
// .carousel__slide (+ .carousel__nav with .carousel__count; the pills and the pager are built here, and the count moves
// into the pager). An arrow fades at the first or last image.
// Without JS the track is still a swipeable, scrollable row.

document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".carousel__track");
  const slides = [...track.children];
  const nav = root.querySelector(".carousel__nav");
  const count = root.querySelector(".carousel__count");
  if (!slides.length) return;

  root.classList.add("is-ready");
  let index = 0;

  const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);

  const update = () => {
    index = Math.round(track.scrollLeft / step());
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    pills.forEach((p, i) => { p.classList.toggle("is-on", i === index); p.setAttribute("aria-current", i === index ? "true" : "false"); });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    slides.forEach((s, i) => s.setAttribute("aria-hidden", i === index ? "false" : "true"));
  };

  const go = (i) => track.scrollTo({ left: i * step(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  const pills = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "carousel__pill";
    b.setAttribute("aria-label", `Show image ${i + 1} of ${slides.length}`);
    b.addEventListener("click", () => go(i));
    return b;
  });
  const row = document.createElement("div");
  row.className = "carousel__pills";
  row.append(...pills);
  nav?.prepend(row);
  // the pager: ‹ count › in one rounded control, so the arrows read as "this changes the image" and sit with the count
  const arrow = (dir) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `carousel__arrow carousel__arrow--${dir}`;
    b.setAttribute("aria-label", dir === "prev" ? "Previous image" : "Next image");
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === "prev" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}"/></svg>`;
    b.addEventListener("click", () => go(index + (dir === "prev" ? -1 : 1)));
    return b;
  };
  const prev = arrow("prev"), next = arrow("next");
  const pager = document.createElement("div");
  pager.className = "carousel__pager";
  pager.append(prev);
  if (count) pager.append(count);
  pager.append(next);
  row.after(pager);
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  });

  let raf = 0;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
});
