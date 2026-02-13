(() => {
  const grid = document.getElementById("momentsGrid");
  const empty = document.getElementById("momentsEmpty");
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbTitle = document.getElementById("lbTitle");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const shuffleBtn = document.getElementById("shuffleBtn");
  if (!grid) return;

  let items = [];
  let current = 0;
  const MANIFEST_LOCAL = "./assets/moments/manifest.json";
  const MANIFEST_SERVER = "/assets/moments/manifest.json";

  function toImageList(names, prefix = "./assets/moments/") {
    return (names || []).map((name) => ({
      name,
      url: `${prefix}${encodeURIComponent(name)}`,
    }));
  }

  function readInlineData() {
    const node = document.getElementById("momentsData");
    if (!node) return [];
    try {
      const data = JSON.parse(node.textContent || "");
      if (Array.isArray(data?.images)) return toImageList(data.images);
      if (Array.isArray(data)) return toImageList(data);
    } catch {
      return [];
    }
    return [];
  }

  async function loadManifest() {
    const url = window.location.protocol === "file:" ? MANIFEST_LOCAL : MANIFEST_SERVER;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Manifest error");
      if (Array.isArray(data?.images)) return toImageList(data.images);
      if (Array.isArray(data)) return toImageList(data);
      return [];
    } catch {
      return [];
    }
  }

  function prettyName(fileName) {
    const base = fileName.replace(/\.[a-z0-9]+$/i, "");
    const cleaned = base.replace(/[-_]+/g, " ").trim();
    return cleaned ? cleaned : "Moment";
  }

  function open(index) {
    current = Math.max(0, Math.min(items.length - 1, index));
    const it = items[current];
    lbImg.src = it.url;
    lbImg.alt = it.name;
    lbTitle.textContent = `Moment ${current + 1} — ${prettyName(it.name)}`;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  function next() {
    if (!items.length) return;
    open((current + 1) % items.length);
  }

  function prev() {
    if (!items.length) return;
    open((current - 1 + items.length) % items.length);
  }

  function render() {
    grid.innerHTML = "";
    if (!items.length) {
      empty?.classList.remove("hidden");
      empty?.removeAttribute("hidden");
      return;
    }
    empty?.setAttribute("hidden", "true");

    items.forEach((it, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "polaroid reveal";
      btn.style.setProperty("--tilt", (Math.random() * 8 - 4).toFixed(2));
      btn.style.setProperty("--delay", (Math.random() * 1.8).toFixed(2));
      btn.addEventListener("click", () => open(idx));

      const photo = document.createElement("div");
      photo.className = "photo";
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = it.url;
      img.alt = it.name;
      photo.appendChild(img);

      const cap = document.createElement("div");
      cap.className = "cap";
      cap.innerHTML = `<span>${prettyName(it.name)}</span><small>❤</small>`;

      btn.append(photo, cap);
      grid.appendChild(btn);
    });

    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("is-visible"));
  }

  async function load() {
    if (window.location.protocol === "file:") {
      items = readInlineData();
      if (!items.length) items = await loadManifest();
      render();
      return;
    }

    try {
      const res = await fetch("/api/moments");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load moments");
      items = Array.isArray(data.images) ? data.images : [];
    } catch {
      items = readInlineData();
      if (!items.length) items = await loadManifest();
    }
    render();
  }

  shuffleBtn?.addEventListener("click", () => {
    items = items
      .map((x) => ({ x, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((o) => o.x);
    render();
    window.ValentineUI?.toast?.("Shuffled ✨", { kind: "good" });
  });

  lbClose?.addEventListener("click", close);
  lbNext?.addEventListener("click", next);
  lbPrev?.addEventListener("click", prev);
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  window.addEventListener("keydown", (e) => {
    if (!lb?.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  load();
})();
