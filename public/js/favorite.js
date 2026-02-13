(() => {
  const video = document.getElementById("loveVideo");
  const unmute = document.getElementById("unmuteBtn");
  const music = document.getElementById("loveMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicStop = document.getElementById("musicStop");
  if (!video) return;

  const LOCAL_SRC = "./assets/video.mp4";
  const FALLBACK = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
  const MUSIC_LOCAL = "./assets/music.mp3";
  const MUSIC_SERVER = "/assets/music.mp3";

  async function pickSource() {
    try {
      const res = await fetch("/assets/video.mp4", { method: "HEAD" });
      if (res.ok) return "/assets/video.mp4";
    } catch {
      // ignore
    }
    return FALLBACK;
  }

  async function init() {
    if (window.location.protocol === "file:") {
      video.src = LOCAL_SRC;
    } else {
      const src = await pickSource();
      video.src = src;
    }

    try {
      await video.play();
    } catch {
      // Autoplay can be blocked; user gesture will start it.
    }

    if (music) {
      music.src = window.location.protocol === "file:" ? MUSIC_LOCAL : MUSIC_SERVER;
      music.addEventListener("error", () => {
        window.ValentineUI?.toast?.("Add your song at public/assets/music.mp3", { kind: "bad", title: "Music missing" });
      });
      music.addEventListener("play", () => {
        if (musicToggle) musicToggle.textContent = "Pause Music";
      });
      music.addEventListener("pause", () => {
        if (musicToggle) musicToggle.textContent = "Play Music";
      });
    }
  }

  unmute?.addEventListener("click", async () => {
    try {
      video.muted = false;
      await video.play();
      unmute.classList.add("hidden");
      window.ValentineFX?.burst?.({ count: 22, x: window.innerWidth * 0.75, y: window.innerHeight * 0.55 });
      window.ValentineUI?.toast?.("Sound on 💗", { kind: "good", title: "Aww" });
    } catch {
      window.ValentineUI?.toast?.("Tap the video once to allow sound.", { kind: "bad", title: "Blocked" });
    }
  });

  video.addEventListener("click", async () => {
    if (!video.paused) return;
    try {
      await video.play();
    } catch {
      // ignore
    }
  });

  video.addEventListener("error", () => {
    if (video.dataset.fallback === "true") return;
    video.dataset.fallback = "true";
    video.src = FALLBACK;
    video.load();
  });

  musicToggle?.addEventListener("click", async () => {
    if (!music) return;
    if (music.paused) {
      try {
        await music.play();
      } catch {
        window.ValentineUI?.toast?.("Tap again to allow sound.", { kind: "bad", title: "Blocked" });
      }
    } else {
      music.pause();
    }
  });

  musicStop?.addEventListener("click", () => {
    if (!music) return;
    music.pause();
    music.currentTime = 0;
  });

  window.addEventListener("beforeunload", () => {
    if (music) music.pause();
  });

  init();
})();
