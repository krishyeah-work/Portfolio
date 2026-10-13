// clock.js — live Bengaluru time (IST) in the footer, with sliding digits.
// Markup: <span data-clock></span>. Digits roll like the motion-primitives SlidingNumber.

(() => {
  const root = document.querySelector("[data-clock]");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const now = () => {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
    return `${p.hour}${p.minute}${p.second}`;
  };

  // Build: HH:MM:SS, each digit a vertical strip 0–9 (+ a trailing 0 for a forward roll 9 → 0).
  const strip = '<span class="sn__track">' + "01234567890".split("").map((d) => `<span>${d}</span>`).join("") + "</span>";
  root.classList.add("clock");
  root.innerHTML =
    '<span class="clock__digits" aria-hidden="true">' +
    [0, 1, 2, 3, 4, 5].map((i) => `<span class="sn">${strip}</span>${i === 1 || i === 3 ? '<span class="clock__sep">:</span>' : ""}`).join("") +
    '</span><span class="clock__tz" aria-hidden="true">IST</span><span class="sr-only" data-clock-sr></span>';

  const cells = [...root.querySelectorAll(".sn")];
  const sr = root.querySelector("[data-clock-sr]");

  const set = (cell, d) => {
    const track = cell.firstElementChild;
    const prev = cell._d;
    cell._d = d;
    if (prev === 9 && d === 0 && !reduce) {
      // roll forward to the trailing 0, then snap back to the first 0 without animating
      track.style.transform = "translateY(-10em)";
      track.addEventListener("transitionend", () => {
        track.style.transition = "none";
        track.style.transform = "translateY(0)";
        track.offsetHeight; // apply before restoring the transition
        track.style.transition = "";
      }, { once: true });
    } else {
      track.style.transform = `translateY(${-d}em)`;
    }
  };

  let lastMinute = "";
  const tick = () => {
    const t = now();
    cells.forEach((c, i) => { const d = +t[i]; if (c._d !== d) set(c, d); });
    const minute = `${t.slice(0, 2)}:${t.slice(2, 4)}`;
    if (minute !== lastMinute) { lastMinute = minute; sr.textContent = `Bengaluru time ${minute}`; }
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };
  tick();
})();
