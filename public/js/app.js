(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function normalizePath(pathname) {
    if (!pathname || pathname === "/") return "index.html";
    let base = pathname.split("/").filter(Boolean).pop() || "index.html";
    if (!base.includes(".")) base += ".html";
    return base;
  }

  function normalizeHref(href) {
    if (!href) return "";
    try {
      const url = new URL(href, window.location.href);
      let base = url.pathname.split("/").filter(Boolean).pop() || "index.html";
      if (!base.includes(".")) base += ".html";
      return base;
    } catch {
      return href.replace(/^\.\/+/, "");
    }
  }

  function setActiveNav() {
    const links = document.querySelectorAll(".nav a[data-nav]");
    const current = normalizePath(window.location.pathname);
    links.forEach((a) => a.removeAttribute("aria-current"));

    const match = Array.from(links).find((a) => normalizeHref(a.getAttribute("href")) === current);
    if (match) match.setAttribute("aria-current", "page");
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (items.length === 0) return;
    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
  }

  function toast(message, { kind = "good", title } = {}) {
    let host = document.getElementById("toastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "toastHost";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.dataset.kind = kind;
    el.innerHTML = title ? `<strong>${title}</strong><div>${message}</div>` : `<div>${message}</div>`;
    host.appendChild(el);
    window.setTimeout(() => el.remove(), 2600);
  }

  window.ValentineUI = { toast };

  window.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initReveal();
    window.setTimeout(() => document.body.classList.remove("is-loading"), prefersReducedMotion ? 0 : 240);
  });
})();
