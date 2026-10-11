// lightbox.js — click any case-study screen to view it full screen.
// Click the enlarged image to zoom in where you clicked; move to pan; click again to zoom out.
// Close with the "Back" button, the Esc key, or a click outside the image.
// Opt in: .shot img, or any img[data-zoom]. A sharper file can be given with data-full.

(() => {
  const targets = [...document.querySelectorAll("main .shot img, main img[data-zoom]")].filter((img) => !img.closest("a"));
  if (!targets.length) return;

  const box = document.createElement("div");
  box.className = "lb";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Enlarged image");
  box.innerHTML = `
    <button type="button" class="lb__close" aria-label="Close enlarged image"><span class="lb__x" aria-hidden="true">×</span><span class="lb__back">Back</span></button>
    <div class="lb__frame"><img class="lb__img" alt=""></div>
    <p class="lb__hint" aria-hidden="true">Click to zoom · Esc to close</p>`;
  document.body.append(box);

  const img = box.querySelector(".lb__img");
  const close = box.querySelector(".lb__close");
  let opener = null;
  let zoomed = false;

  const setOrigin = (e) => {
    const r = img.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    img.style.transformOrigin = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
  };

  const zoomScale = () => {
    const natural = img.naturalWidth / img.getBoundingClientRect().width;
    return Math.max(2, Math.min(3, natural));
  };

  const setZoom = (on, e) => {
    zoomed = on;
    if (on && e) setOrigin(e);
    img.style.transform = on ? `scale(${zoomScale()})` : "";
    box.classList.toggle("is-zoomed", on);
  };

  const open = (src) => {
    opener = src;
    img.src = src.dataset.full || src.currentSrc || src.src;
    img.alt = src.alt;
    setZoom(false);
    box.hidden = false;
    document.documentElement.classList.add("lb-open");
    requestAnimationFrame(() => box.classList.add("is-open"));
    close.focus();
  };

  const shut = () => {
    box.classList.remove("is-open");
    document.documentElement.classList.remove("lb-open");
    setZoom(false);
    box.hidden = true;
    img.removeAttribute("src");
    opener?.focus();
  };

  targets.forEach((t) => {
    t.tabIndex = 0;
    t.setAttribute("role", "button");
    t.setAttribute("aria-label", `Enlarge image: ${t.alt}`);
    t.classList.add("is-zoomable");
    t.addEventListener("click", () => open(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); }
    });
  });

  img.addEventListener("click", (e) => { e.stopPropagation(); setZoom(!zoomed, e); });
  img.addEventListener("pointermove", (e) => { if (zoomed) setOrigin(e); });
  box.addEventListener("click", (e) => { if (e.target === box || e.target.classList.contains("lb__frame")) shut(); });
  close.addEventListener("click", shut);
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") shut();
    if (e.key === "Tab") { e.preventDefault(); close.focus(); }
  });
})();
