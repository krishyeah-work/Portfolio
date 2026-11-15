// picto.js — the clips on the Picto case study (video[data-play]).
// - Each clip loads and plays only while it's on screen, and pauses when it leaves, so the page stays light.
// - Each has a small pause / play button (they loop, and anything moving that long should be stoppable).
// - With reduced motion nothing plays by itself: the still poster shows, with the browser's own controls.

(() => {
  const vids = [...document.querySelectorAll("video[data-play]")];
  if (!vids.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
  const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';

  if (reduce) { vids.forEach((v) => { v.controls = true; v.preload = "none"; }); return; }

  const stopped = new WeakSet(); // clips the visitor paused stay paused
  vids.forEach((v) => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "pc-vid__toggle";
    const set = (paused) => { btn.innerHTML = paused ? PLAY : PAUSE; btn.setAttribute("aria-label", paused ? "Play the clip" : "Pause the clip"); btn.setAttribute("aria-pressed", String(paused)); };
    set(false);
    btn.addEventListener("click", () => {
      if (v.paused) { stopped.delete(v); v.play().catch(() => {}); set(false); }
      else { stopped.add(v); v.pause(); set(true); }
    });
    v.parentElement.append(btn);
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.35) { // at least a third on screen
        if (v.preload !== "auto") v.preload = "auto";
        if (!stopped.has(v)) v.play().catch(() => {});
      } else v.pause();
    }
  }, { threshold: [0, 0.35] }); // 0 too, so a clip that slides fully off screen is told to stop
  vids.forEach((v) => io.observe(v));
})();
