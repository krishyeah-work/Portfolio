// pal.js — Pal, the little companion in the footer.
// • Linked to Bengaluru time: asleep from 11:00 PM to 6:30 AM IST, awake the rest of the day.
// • First click says hello in the visitor's language (state-level in India, country elsewhere).
// • Click to chat, double-click to nap, triple-click a sleeping Pal for an "emergency" wake-up,
//   click 4× fast and Pal gets annoyed, circle the cursor around Pal twice and it gets dizzy.
// Markup: <span data-pal></span>. Character, lines and interactions from Krishna's Pal prototype.

(() => {
  const mount = document.querySelector("[data-pal]");
  if (!mount) return;

  mount.outerHTML = `
    <div class="pal-target" id="palTarget" tabindex="0" role="button" aria-label="Pal, a little companion. Click to chat, double-click to nap.">
      <span class="pal" id="pal" aria-hidden="true">
        <span class="ears"><span class="ear left">/)</span><span class="ear right">/)</span></span>
        <span class="face"><span class="side">(</span><span class="eye">•</span><span class="eye-gap"> </span><span class="eye">•</span><span class="side">)</span></span>
      </span>
      <span class="bubble" id="palBubble" role="status" aria-live="polite"></span>
      <span class="zzz" aria-hidden="true"><span>Z</span><span>z</span><span>Z</span><span>z</span></span>
    </div>`;

  const target = document.getElementById("palTarget");
  const pal = document.getElementById("pal");
  const eyes = [...target.querySelectorAll(".eye")];
  const bubble = document.getElementById("palBubble");

  const awakeLines = ["That's funny...", "Hey, human.", "I'm Pal, happy to help.", "Was that a fly?", "You seem nice.", "Name's Pal. Nice to meet you.", "I'm Pal, here to cheer you on.", "What are you working on today?", "Need a hand? I am right here.", "You've got this. One step at a time.", "I am glad you stopped by.", "We make a good team.", "Did you see that?", "Okay, zoomies!"];
  const sleepLines = ["Lemme sleep.", "Good night.", "It's dark in here.", "Let's talk in the daytime.", "Just five more minutes.", "I was having a nice dream.", "Shhh... sleepy Pal.", "Wake me at sunrise.", "I am counting sheep."];

  /* ---------- Bengaluru schedule ---------- */
  const istFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const preview = new URLSearchParams(location.search).get("pal"); // ?pal=awake or ?pal=asleep to preview a state
  const scheduledSleep = () => {
    if (preview === "awake") return false;
    if (preview === "asleep") return true;
    const [h, m] = istFmt.format(new Date()).split(":").map(Number);
    const mins = h * 60 + m;
    return mins >= 23 * 60 || mins < 6 * 60 + 30;
  };

  /* ---------- Hello in the visitor's language ---------- */
  const IN_STATES = {
    KA: ["Namaskara", "Kannada"], AP: ["Namaskaram", "Telugu"], TG: ["Namaskaram", "Telugu"], TS: ["Namaskaram", "Telugu"],
    TN: ["Vanakkam", "Tamil"], PY: ["Vanakkam", "Tamil"], KL: ["Namaskaram", "Malayalam"], MH: ["Namaskar", "Marathi"],
    GJ: ["Kem cho", "Gujarati"], PB: ["Sat Sri Akal", "Punjabi"], WB: ["Nomoshkar", "Bengali"], OR: ["Namaskar", "Odia"],
    OD: ["Namaskar", "Odia"], AS: ["Nomoskar", "Assamese"], GA: ["Namaskar", "Konkani"],
  };
  const COUNTRIES = {
    IN: ["Namaste", "Hindi"], JP: ["Konnichiwa", "Japanese"], CN: ["Ni hao", "Mandarin"], TW: ["Ni hao", "Mandarin"],
    KR: ["Annyeonghaseyo", "Korean"], FR: ["Bonjour", "French"], ES: ["Hola", "Spanish"], MX: ["Hola", "Spanish"],
    AR: ["Hola", "Spanish"], CO: ["Hola", "Spanish"], CL: ["Hola", "Spanish"], PE: ["Hola", "Spanish"],
    DE: ["Hallo", "German"], AT: ["Hallo", "German"], CH: ["Grüezi", "Swiss German"], IT: ["Ciao", "Italian"],
    PT: ["Olá", "Portuguese"], BR: ["Olá", "Portuguese"], NL: ["Hallo", "Dutch"], SE: ["Hej", "Swedish"],
    DK: ["Hej", "Danish"], NO: ["Hei", "Norwegian"], FI: ["Hei", "Finnish"], PL: ["Cześć", "Polish"],
    RU: ["Privet", "Russian"], UA: ["Pryvit", "Ukrainian"], TR: ["Merhaba", "Turkish"], GR: ["Yassou", "Greek"],
    AE: ["Marhaba", "Arabic"], SA: ["Marhaba", "Arabic"], EG: ["Marhaba", "Arabic"], QA: ["Marhaba", "Arabic"],
    IL: ["Shalom", "Hebrew"], ID: ["Halo", "Indonesian"], TH: ["Sawasdee", "Thai"], VN: ["Xin chào", "Vietnamese"],
    PH: ["Kumusta", "Filipino"], NP: ["Namaste", "Nepali"], LK: ["Ayubowan", "Sinhala"], BD: ["Nomoshkar", "Bengali"],
    PK: ["Assalam-o-Alaikum", "Urdu"],
  };
  const LANGS = {
    ja: "JP", zh: "CN", ko: "KR", fr: "FR", es: "ES", de: "DE", it: "IT", pt: "PT", nl: "NL", sv: "SE", da: "DK",
    nb: "NO", no: "NO", fi: "FI", pl: "PL", ru: "RU", uk: "UA", tr: "TR", el: "GR", ar: "AE", he: "IL", id: "ID",
    th: "TH", vi: "VN", ne: "NP", si: "LK", ur: "PK", hi: "IN",
  };
  const INDIAN_LANGS = { kn: "KA", te: "AP", ta: "TN", ml: "KL", mr: "MH", gu: "GJ", pa: "PB", bn: "WB", or: "OR", as: "AS" };
  const ZONES = {
    "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Taipei": "TW", "Asia/Seoul": "KR",
    "Europe/Paris": "FR", "Europe/Madrid": "ES", "Europe/Berlin": "DE", "Europe/Vienna": "AT", "Europe/Zurich": "CH", "Europe/Rome": "IT",
    "Europe/Lisbon": "PT", "America/Sao_Paulo": "BR", "Europe/Amsterdam": "NL", "Europe/Stockholm": "SE", "Europe/Copenhagen": "DK",
    "Europe/Oslo": "NO", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL", "Europe/Moscow": "RU", "Europe/Kyiv": "UA", "Europe/Kiev": "UA",
    "Europe/Istanbul": "TR", "Europe/Athens": "GR", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Africa/Cairo": "EG", "Asia/Jerusalem": "IL",
    "Asia/Jakarta": "ID", "Asia/Bangkok": "TH", "Asia/Ho_Chi_Minh": "VN", "Asia/Manila": "PH", "Asia/Kathmandu": "NP",
    "Asia/Colombo": "LK", "Asia/Dhaka": "BD", "Asia/Karachi": "PK", "America/Mexico_City": "MX",
  };

  let geo = null;
  let geoRequest = null;
  const loadGeo = () => {
    if (geoRequest) return geoRequest;
    const timeout = new Promise((r) => setTimeout(() => r(null), 1500));
    const req = fetch("/api/geo", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    geoRequest = Promise.race([req, timeout]).then((g) => (geo = g && g.country ? g : null));
    return geoRequest;
  };

  const greeting = () => {
    const langs = (navigator.languages || [navigator.language || ""]).map((l) => l.toLowerCase());
    const prefix = (l) => l.split("-")[0];
    let country = geo?.country || ZONES[Intl.DateTimeFormat().resolvedOptions().timeZone] || "";
    let region = geo?.region || "";
    if (!country) {
      const hit = langs.map(prefix).find((p) => LANGS[p] || INDIAN_LANGS[p]);
      if (hit) { country = LANGS[hit] || "IN"; if (INDIAN_LANGS[hit]) region = INDIAN_LANGS[hit]; }
    }
    if (country === "IN" && !region) {
      const hit = langs.map(prefix).find((p) => INDIAN_LANGS[p]);
      if (hit) region = INDIAN_LANGS[hit];
    }
    const pick = (country === "IN" && IN_STATES[region]) || COUNTRIES[country];
    return pick ? `${pick[0]}! That's hello in ${pick[1]}.` : "Hello there!";
  };

  /* ---------- Pal behaviour (from the prototype) ---------- */
  let awakeLineIndex = 0, sleepLineIndex = 0;
  let isSleeping = false, wakingFromSleep = false, greeted = false;
  let happyUntil = 0, dizzyUntil = 0, angryUntil = 0;
  let orbit = { angle: null, start: 0, rotation: 0, direction: 0 };
  let bubbleTimer, fadeTimer, wakeTimer, angryTimer;
  const awakeClicks = [], sleepingClicks = [];

  function showBubble(text, visibleFor = 1650, hideAfter = visibleFor + 400) {
    clearTimeout(bubbleTimer); clearTimeout(fadeTimer);
    bubble.textContent = text;
    bubble.classList.remove("fadeout");
    bubble.classList.add("visible");
    bubbleTimer = setTimeout(() => bubble.classList.add("fadeout"), visibleFor);
    fadeTimer = setTimeout(() => bubble.classList.remove("visible", "fadeout"), hideAfter);
  }

  function updateEyes() {
    const now = Date.now();
    const mode = isSleeping ? "sleep" : now < angryUntil ? "angry" : now < dizzyUntil ? "dizzy" : now < happyUntil ? "happy" : "normal";
    pal.classList.toggle("angry", mode === "angry");
    pal.classList.toggle("dizzy", mode === "dizzy");
    pal.classList.toggle("sleeping", mode === "sleep");
    if (mode === "angry") { eyes[0].textContent = "•\\"; eyes[1].textContent = "/•"; }
    else {
      const marks = mode === "sleep" ? "-" : mode === "dizzy" ? "꩜" : mode === "happy" ? "^" : "•";
      eyes.forEach((eye) => { eye.textContent = marks; });
    }
  }

  const resetOrbit = () => { orbit = { angle: null, start: 0, rotation: 0, direction: 0 }; };

  function setSleeping(sleeping) {
    isSleeping = sleeping;
    target.classList.toggle("sleeping", sleeping);
    target.setAttribute("aria-label", sleeping ? "Pal is asleep. Click to chat." : "Pal, a little companion. Click to chat, double-click to nap.");
    if (sleeping) {
      happyUntil = dizzyUntil = angryUntil = 0;
      awakeClicks.length = 0; sleepingClicks.length = 0;
      clearTimeout(angryTimer);
      eyes.forEach((eye) => { eye.style.transform = ""; });
    }
    resetOrbit();
    updateEyes();
  }

  function wakeForEmergency() {
    setSleeping(false);
    wakingFromSleep = true;
    pal.classList.add("waking");
    showBubble("Is there an emergency?", 4100, 4500);
    wakeTimer = setTimeout(() => {
      wakingFromSleep = false;
      pal.classList.remove("waking");
      setSleeping(scheduledSleep()); // back to sleep only if it's night in Bengaluru
    }, 4500);
  }

  function recordOrbit(distance, angle, now) {
    if (distance < 40 || distance > 260) { resetOrbit(); return; }
    if (orbit.angle === null || now - orbit.start > 1000) { orbit = { angle, start: now, rotation: 0, direction: 0 }; return; }
    let delta = angle - orbit.angle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    if (Math.abs(delta) > 1.1) { orbit = { angle, start: now, rotation: 0, direction: 0 }; return; }
    if (Math.abs(delta) <= 0.015) return;
    const direction = Math.sign(delta);
    if (orbit.direction && direction !== orbit.direction) { orbit = { angle, start: now, rotation: 0, direction: 0 }; return; }
    orbit.direction = direction;
    orbit.rotation += delta;
    orbit.angle = angle;
    if (Math.abs(orbit.rotation) >= Math.PI * 4 && now - orbit.start <= 1000) {
      dizzyUntil = Date.now() + 1400;
      updateEyes();
      setTimeout(updateEyes, 1450);
      resetOrbit();
    }
  }

  // Eye tracking only while Pal is on screen.
  let near = false, raf = 0, last = null;
  new IntersectionObserver(([e]) => { near = e.isIntersecting; }, { rootMargin: "200px" }).observe(target);
  window.addEventListener("pointermove", (event) => {
    if (!near) return;
    last = event;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const dx = last.clientX - (rect.left + rect.width / 2);
      const dy = last.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (isSleeping || wakingFromSleep) { eyes.forEach((eye) => { eye.style.transform = ""; }); resetOrbit(); return; }
      if (distance <= 288) {
        eyes.forEach((eye) => { eye.style.transform = `translate(${Math.max(-1, Math.min(1, dx / 288)) * 4}px, ${Math.max(-1, Math.min(1, dy / 288)) * 3}px)`; });
      } else {
        eyes.forEach((eye) => { eye.style.transform = ""; });
      }
      recordOrbit(distance, Math.atan2(dy, dx), performance.now());
    });
  }, { passive: true });

  function handleAwakeClick() {
    const now = Date.now();
    awakeClicks.push(now);
    while (awakeClicks.length && now - awakeClicks[0] > 1000) awakeClicks.shift();
    if (awakeClicks.length >= 4) {
      angryUntil = now + 1800;
      awakeClicks.length = 0;
      showBubble("Okay, easy there! Pal needs a breather.");
      let alternate = false;
      const cycle = () => {
        if (Date.now() >= angryUntil || isSleeping) { updateEyes(); return; }
        eyes[0].textContent = alternate ? "-" : "•\\";
        eyes[1].textContent = alternate ? "-" : "/•";
        alternate = !alternate;
        angryTimer = setTimeout(cycle, 420);
      };
      cycle();
      return;
    }
    happyUntil = now + 1500;
    updateEyes();
    setTimeout(updateEyes, 1550);
    if (!greeted) {
      greeted = true;
      loadGeo().then(() => showBubble(greeting(), 2400));
      return;
    }
    showBubble(awakeLines[awakeLineIndex % awakeLines.length]);
    awakeLineIndex++;
  }

  target.addEventListener("pointerenter", loadGeo, { once: true });
  target.addEventListener("focus", loadGeo, { once: true });

  target.addEventListener("click", () => {
    if (wakingFromSleep) return;
    if (isSleeping) {
      const now = Date.now();
      sleepingClicks.push(now);
      while (sleepingClicks.length && now - sleepingClicks[0] > 900) sleepingClicks.shift();
      if (sleepingClicks.length >= 3) { sleepingClicks.length = 0; wakeForEmergency(); }
      else { showBubble(sleepLines[sleepLineIndex % sleepLines.length]); sleepLineIndex++; }
      return;
    }
    handleAwakeClick();
  });

  target.addEventListener("dblclick", () => {
    if (isSleeping || wakingFromSleep) return;
    clearTimeout(wakeTimer);
    setSleeping(true);
    showBubble("Good night.");
  });

  target.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); target.click(); }
  });

  /* ---------- Follow the clock ---------- */
  let scheduled = scheduledSleep();
  setSleeping(scheduled);
  setInterval(() => {
    const s = scheduledSleep();
    if (s !== scheduled) {          // only at the 11:00 PM / 6:30 AM boundaries
      scheduled = s;
      if (!wakingFromSleep) setSleeping(s);
      if (!s) showBubble("Good morning!", 2200);
    }
  }, 20000);
})();
