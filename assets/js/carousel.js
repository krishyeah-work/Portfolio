// carousel.js — scroll-snap carousel: swipe, arrow keys, or a row of slim pills (one per image) and a counter.
// Markup: [data-carousel] > .carousel__track > .carousel__slide (+ .carousel__nav with .carousel__count; the pills are added here).
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
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  });

  let raf = 0;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
});
