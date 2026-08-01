document.addEventListener('DOMContentLoaded', () => {
  const initClock = () => {
    const clockEl = document.getElementById('clock-widget');
    if (!clockEl) return;

    const hour = clockEl.querySelector('.hour');
    const min = clockEl.querySelector('.min');
    const sec = clockEl.querySelector('.sec');

    if (!hour || !min || !sec) return;

    const updateClock = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds() + ms / 1000;       // 精确到毫秒的秒数
      const m = now.getMinutes() + s / 60;          // 随秒数平滑移动的分数
      const h = (now.getHours() % 12) + m / 60;     // 随分数平滑移动的时数

      // 360deg / 12h = 30deg/h
      // 360deg / 60m = 6deg/m
      // 360deg / 60s = 6deg/s
      hour.style.transform = `rotateZ(${h * 30}deg)`;
      min.style.transform = `rotateZ(${m * 6}deg)`;
      sec.style.transform = `rotateZ(${s * 6}deg)`;

      // 请求下一帧更新，保持丝滑
      window.clockAnimationId = requestAnimationFrame(updateClock);
    };

    // 清除可能存在的旧帧循环，防止 PJAX 跳转累积
    if (window.clockAnimationId) {
      cancelAnimationFrame(window.clockAnimationId);
    }

    // 启动帧循环
    window.clockAnimationId = requestAnimationFrame(updateClock);
  };

  initClock();

  // PJAX 页面切换后重新初始化
  document.addEventListener('pjax:complete', initClock);
});