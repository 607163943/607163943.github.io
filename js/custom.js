document.addEventListener('DOMContentLoaded', () => {
  const initClock = () => {
    const clockEl = document.getElementById('clock-widget');
    if (!clockEl) return;

    const deg = 6;
    const hour = clockEl.querySelector('.hour');
    const min = clockEl.querySelector('.min');
    const sec = clockEl.querySelector('.sec');

    if (!hour || !min || !sec) return;

    const setClock = () => {
      let day = new Date();
      let hh = day.getHours() * 30;
      let mm = day.getMinutes() * deg;
      let ss = day.getSeconds() * deg;

      hour.style.transform = `rotateZ(${hh + mm / 12}deg)`;
      min.style.transform = `rotateZ(${mm}deg)`;
      sec.style.transform = `rotateZ(${ss}deg)`;
    };

    setClock();
    
    // 清除可能存在的旧定时器，防止 PJAX 重载导致累积
    if (window.clockTimer) clearInterval(window.clockTimer);
    window.clockTimer = setInterval(setClock, 1000);
  };

  initClock();

  // 如果开启了 PJAX 局部加载，在页面切换后重新初始化
  document.addEventListener('pjax:complete', initClock);
});