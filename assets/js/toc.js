// toc.js — highlights the case-study contents link for the section in view. Optional enhancement.
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
