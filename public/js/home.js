(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const stat = document.querySelector("[data-auto-stat]");
    if (!stat) return;
    const target = Number(stat.getAttribute("data-auto-stat") || "7");
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) {
      stat.textContent = String(target);
      return;
    }

    const start = performance.now();
    const dur = 900;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      stat.textContent = String(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();

