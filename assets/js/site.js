// Progressive enhancement only. Every page works without this file.

// Receipt demo: visuals switch via CSS :has(); this announces the outcome to screen readers.
document.querySelectorAll("[data-receipt]").forEach((receipt) => {
  const live = receipt.querySelector("[data-receipt-live]");
  const messages = {
    pending: "Approval pending. Due today: Email Marketing only. SMS is charged later, only if approved.",
    approved: "SMS approved. The saved card is charged for SMS. Today's charge is unchanged.",
    denied: "SMS not approved. SMS is never charged. Only Email Marketing was paid.",
  };
  receipt.addEventListener("change", (e) => {
    if (live && e.target.name && messages[e.target.value]) live.textContent = messages[e.target.value];
  });
});

// Case-study contents: highlight the section in view.
const tocLinks = document.querySelectorAll(".toc a[href^='#']");
if (tocLinks.length && "IntersectionObserver" in window) {
  const byId = new Map([...tocLinks].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}
