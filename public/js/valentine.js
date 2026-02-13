(() => {
  const btn = document.getElementById("valentineBurst");
  btn?.addEventListener("click", () => {
    window.ValentineFX?.burst?.({ count: 26 });
    window.ValentineUI?.toast?.("My Vallentine 💗", { kind: "good", title: "For Gunjan" });
  });
})();
