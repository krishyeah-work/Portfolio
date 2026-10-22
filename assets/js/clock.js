// clock.js — live Bengaluru time in the footer, 12-hour, with sliding digits: "01:44 AM in Bangalore".
// Markup: <span data-clock></span>. Digits roll like the motion-primitives SlidingNumber.

(() => {
  const root = document.querySelector("[data-clock]");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h12" });
  const now = () => {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { digits: `${p.hour}${p.minute}`, period: (p.dayPeriod || "").toUpperCase() };
  };

  // Build: HH:MM AM, each digit a vertical strip 0–9 (+ a trailing 0 for a forward roll 9 → 0).
  const strip = '<span class="sn__track">' + "01234567890".split("").map((d) => `<span>${d}</span>`).join("") + "</span>";
  root.classList.add("clock");
  root.innerHTML =
    '<span class="clock__digits" aria-hidden="true">' +
    [0, 1, 2, 3].map((i) => `<span class="sn">${strip}</span>${i === 1 ? '<span class="clock__sep">:</span>' : ""}`).join("") +
    '</span><span class="clock__ampm" aria-hidden="true" data-clock-period></span><span class="clock__place" aria-hidden="true">in Bangalore</span><span class="sr-only" data-clock-sr></span>';

  const cells = [...root.querySelectorAll(".sn")];
  const sr = root.querySelector("[data-clock-sr]");
  const period = root.querySelector("[data-clock-period]");

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
    const { digits: t, period: ap } = now();
    cells.forEach((c, i) => { const d = +t[i]; if (c._d !== d) set(c, d); });
    const minute = `${t.slice(0, 2)}:${t.slice(2, 4)} ${ap}`;
    if (minute !== lastMinute) { lastMinute = minute; period.textContent = ap; sr.textContent = `${minute} in Bangalore`; }
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };
  tick();
})();
