// carousel.js — scroll-snap carousel with previous/next buttons and a counter.
// Markup: [data-carousel] > .carousel__track > .carousel__slide (+ .carousel__nav).
// Without JS the track is still a swipeable, scrollable row.

document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".carousel__track");
  const slides = [...track.children];
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const count = root.querySelector(".carousel__count");
  if (!slides.length) return;

  root.classList.add("is-ready");
  let index = 0;

  const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);

  const update = () => {
    index = Math.round(track.scrollLeft / step());
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    slides.forEach((s, i) => s.setAttribute("aria-hidden", i === index ? "false" : "true"));
  };

  const go = (i) => track.scrollTo({ left: i * step(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  });

  let raf = 0;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
});
