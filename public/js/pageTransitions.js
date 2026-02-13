(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const DURATION_MS = prefersReducedMotion ? 0 : 520;

  function isModifiedClick(evt) {
    return evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey || evt.button !== 0;
  }

  function sameOrigin(url) {
    try {
      return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (evt) => {
      const a = evt.target?.closest?.("a[data-nav]");
      if (!a) return;
      if (isModifiedClick(evt)) return;

      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (!sameOrigin(href)) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.hash === window.location.hash) return;
      evt.preventDefault();

      document.body.classList.add("is-navigating");
      window.setTimeout(() => {
        window.location.assign(href);
      }, DURATION_MS);
    });
  });
})();
