(function () {
  const DEG = 6;

  function initOneClock(root) {
    const hour = root.querySelector(".hour");
    const min = root.querySelector(".min");
    const sec = root.querySelector(".sec");
    if (!hour || !min || !sec) return;

    // 避免 PJAX 重复绑定
    if (root.__clockRAF) cancelAnimationFrame(root.__clockRAF);

    const tick = () => {
      // 如果元素已不在 DOM（PJAX 切页），停止动画
      if (!document.body.contains(root)) {
        root.__clockRAF = null;
        return;
      }

      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      const ss = (s + ms / 1000) * DEG;
      const mm = (m + s / 60 + ms / 60000) * DEG;
      const hh = (h + m / 60 + s / 3600 + ms / 3600000) * 30;

      hour.style.transform = `rotateZ(${hh}deg)`;
      min.style.transform = `rotateZ(${mm}deg)`;
      sec.style.transform = `rotateZ(${ss}deg)`;

      root.__clockRAF = requestAnimationFrame(tick);
    };

    tick();
  }

  function boot() {
    document
      .querySelectorAll("#widget-clock .analog-clock-widget")
      .forEach(initOneClock);
  }

  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("pjax:complete", boot);
})();
