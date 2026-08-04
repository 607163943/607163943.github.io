/**
 * StarWeb — 深空星座粒子网络加载动画
 * 在 #loading-canvas 上绘制动态粒子 + 连线，配合 #loading-box 的显示/隐藏
 * 支持 PJAX 页面切换时的重新初始化
 */
(() => {
  const canvas = document.getElementById('loading-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let dots = [];
  let animationId = null;
  let running = false;

  // ── 配置 ──────────────────────────────────────────
  const PARTICLE_COUNT = 80;       // 星座节点数量
  const DOT_COUNT = 100;           // 背景星点数量
  const MAX_DISTANCE = 130;        // 连线最大距离 (px)
  const LINE_OPACITY_FACTOR = 0.18; // 连线透明度系数
  const PARTICLE_SPEED = 0.35;     // 星座节点漂浮速度
  const DOT_SPEED = 0.2;           // 背景星点漂浮速度（更慢）
  const PARALLAX_STRENGTH = 45;  // 鼠标视差最大偏移量 (px)

  // ── 主题感知：亮色主题不绘制星空 ──────────────────
  const isDarkTheme = () => document.documentElement.dataset.theme === 'dark';
  let starColor = isDarkTheme() ? '255, 255, 255' : '40, 40, 60';

  function updateStarColor() {
    starColor = isDarkTheme() ? '255, 255, 255' : '40, 40, 60';
  }


  // ── 鼠标视差 ──────────────────────────────────────
  let mouseX = 0.5;  // 归一化鼠标位置 (0~1)
  let mouseY = 0.5;
  let paraX = 0;     // 当前视差偏移 (平滑插值)
  let paraY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  // ── 尺寸适配 ──────────────────────────────────────
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // ── 粒子类 ────────────────────────────────────────
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.size = Math.random() * 2.2 + 0.4;
      // 少数粒子更亮，模拟星星闪烁
      this.bright = Math.random() < 0.15;
      this.alpha = this.bright ? 0.9 : 0.45 + Math.random() * 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // 边界反弹
      if (this.x < 0 || this.x > width)  this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starColor}, ${this.alpha})`;
      ctx.fill();

      // 亮星加辉光
      if (this.bright) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${this.alpha * 0.15})`;
        ctx.fill();
      }
    }
  }

  // ── 背景星点类（缓慢飘移，不参与连线） ──────────
  class Dot {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * DOT_SPEED;
      this.vy = (Math.random() - 0.5) * DOT_SPEED;
      this.size = Math.random() * 1.6 + 0.3;
      this.alpha = 0.2 + Math.random() * 0.35;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width)  this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starColor}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initDots() {
    dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push(new Dot());
    }
  }

  // ── 初始化粒子 ────────────────────────────────────
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  // ── 绘制连线（星座网络） ──────────────────────────
  function drawLines(ctx) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DISTANCE) {
          const opacity = (1 - dist / MAX_DISTANCE) * LINE_OPACITY_FACTOR;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${starColor}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // ── 动画循环 ──────────────────────────────────────
  function animate() {
    if (!running) return;

    // 平滑插值鼠标视差偏移
    const targetX = (mouseX - 0.5) * PARALLAX_STRENGTH;
    const targetY = (mouseY - 0.5) * PARALLAX_STRENGTH;
    paraX += (targetX - paraX) * 0.08;
    paraY += (targetY - paraY) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // 背景星点（深层，视差更小，不连线）
    ctx.save();
    ctx.translate(paraX * 0.3, paraY * 0.3);
    for (const d of dots) {
      d.update();
      d.draw(ctx);
    }
    ctx.restore();

    // 星座粒子网络（浅层，视差更大）
    ctx.save();
    ctx.translate(paraX, paraY);
    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }
    drawLines(ctx);
    ctx.restore();

    animationId = requestAnimationFrame(animate);
  }

  // ── 启停控制 ──────────────────────────────────────
  function start() {
    if (running) return;
    // 只在暗色主题下启动星空特效
    if (!isDarkTheme()) return;
    updateStarColor();
    running = true;
    resize();
    // 避免 resize 后粒子集中在旧区域：重新分布
    if (particles.length === 0) {
      initDots();
      initParticles();
    }
    animate();
  }

  function stop() {
    running = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // ── 观察 #loading-box 的 class 变化 ──────────────
  const loadingBox = document.getElementById('loading-box');
  if (loadingBox) {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (loadingBox.classList.contains('loaded')) {
            stop();
          } else {
            // loading box 重新显示 (PJAX)，检查主题
            if (!isDarkTheme()) return;
            initDots();
            initParticles();
            start();
          }
        }
      }
    });
    observer.observe(loadingBox, { attributes: true, attributeFilter: ['class'] });
  }

  // ── 观察主题切换 ──────────────────────────────────
  const themeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        const isDark = isDarkTheme();
        updateStarColor();
        // loading-box 正在显示中：切暗→启动，切亮→停止
        const box = document.getElementById('loading-box');
        if (box && !box.classList.contains('loaded')) {
          if (isDark) {
            initDots();
            initParticles();
            start();
          } else {
            stop();
          }
        }
      }
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── 窗口 resize ───────────────────────────────────
  window.addEventListener('resize', () => {
    if (running) resize();
  });

  // ── 启动（暗色主题才启动星空） ────────────────────
  start();

  // ── PJAX 事件兜底 ─────────────────────────────────
  document.addEventListener('pjax:complete', () => {
    const box = document.getElementById('loading-box');
    if (box && !box.classList.contains('loaded') && isDarkTheme()) {
      initDots();
      initParticles();
      start();
    }
  });
})();
