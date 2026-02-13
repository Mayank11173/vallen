(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function initBackgroundHearts() {
    if (prefersReducedMotion) return;
    const root = document.getElementById("bgParticles");
    if (!root) return;

    const hearts = ["❤", "💗", "💖", "💞", "💕"];
    const count = Math.min(34, Math.max(18, Math.floor(window.innerWidth / 40)));
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "bg-heart";
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.setProperty("--x", rand(0, 100).toFixed(2));
      el.style.setProperty("--size", rand(12, 34).toFixed(2));
      el.style.setProperty("--delay", rand(0, 18).toFixed(2));
      el.style.setProperty("--duration", rand(14, 26).toFixed(2) + "s");
      el.style.setProperty("--opacity", rand(0.10, 0.32).toFixed(2));
      root.appendChild(el);
    }
  }

  function sparkleAt(x, y) {
    const el = document.createElement("span");
    el.className = "sparkle";
    el.style.left = `${x - 4}px`;
    el.style.top = `${y - 4}px`;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 760);
  }

  function burst({ x, y, count = 14 } = {}) {
    if (prefersReducedMotion) return;
    const cx = x ?? Math.round(window.innerWidth / 2);
    const cy = y ?? Math.round(window.innerHeight / 2);
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.textContent = "❤";
      el.style.position = "fixed";
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.transform = "translate(-50%, -50%)";
      el.style.pointerEvents = "none";
      el.style.zIndex = "9996";
      el.style.fontSize = `${rand(12, 22).toFixed(0)}px`;
      el.style.filter = "drop-shadow(0 10px 18px rgba(0,0,0,.25))";
      const dx = rand(-140, 140);
      const dy = rand(-220, -80);
      const rot = rand(-260, 260);
      const dur = rand(650, 1100);
      el.animate(
        [
          { opacity: 1, transform: `translate(-50%, -50%) rotate(0deg)` },
          { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)` },
        ],
        { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
      );
      document.body.appendChild(el);
      window.setTimeout(() => el.remove(), dur + 50);
    }
  }

  function initPointerSparkles() {
    if (prefersReducedMotion) return;
    let last = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        const now = performance.now();
        if (now - last < 38) return;
        last = now;
        if (Math.random() < 0.55) sparkleAt(e.clientX, e.clientY);
      },
      { passive: true },
    );
  }

  window.ValentineFX = { burst, sparkleAt };

  window.addEventListener("DOMContentLoaded", () => {
    initBackgroundHearts();
    initPointerSparkles();
  });
})();

