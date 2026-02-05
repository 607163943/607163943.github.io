(function () {
  const DEG = 6;

  function initOneClock(root) {
    const hour = root.querySelector(".hour");
    const min = root.querySelector(".min");
    const sec = root.querySelector(".sec");
    if (!hour || !min || !sec) return;

    // 避免 PJAX 重复绑定导致多个 setInterval
    if (root.__clockTimer) clearInterval(root.__clockTimer);

    const setClock = () => {
      const now = new Date();
      const hh = now.getHours() * 30;
      const mm = now.getMinutes() * DEG;
      const ss = now.getSeconds() * DEG;

      hour.style.transform = `rotateZ(${hh + mm / 12}deg)`;
      min.style.transform = `rotateZ(${mm}deg)`;
      sec.style.transform = `rotateZ(${ss}deg)`;
    };

    setClock();
    root.__clockTimer = setInterval(setClock, 1000);
  }

  function boot() {
    // widget.yml 里我们给的是 #widget-clock + .analog-clock-widget
    document
      .querySelectorAll("#widget-clock .analog-clock-widget")
      .forEach(initOneClock);
  }

  document.addEventListener("DOMContentLoaded", boot);
  // Butterfly 常见为 PJAX 站点，切页后需要再初始化一次
  document.addEventListener("pjax:complete", boot);
})();
