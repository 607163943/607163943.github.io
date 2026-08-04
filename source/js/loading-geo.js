/**
 * LoadingGeo — 亮色主题低多边形几何网格加载动画
 * 在 #loading-canvas-geo 上绘制动态几何网格，配合 #loading-box 的显示/隐藏
 * 支持 PJAX 页面切换时的重新初始化
 *
 * 设计思路：
 *   - 随机撒 50 个基准点，每个点连接最近的 3 个邻居形成三角形网格
 *   - 点围绕基准位置做正弦漂移，网格线条随之柔和变形
 *   - 半透明淡紫/淡蓝色线条 + 小型节点，适配亮色背景
 *   - 微妙鼠标视差增强层次感
 */
(() => {
  const canvas = document.getElementById('loading-canvas-geo');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let points = [];
  let edges = [];
  let animationId = null;
  let running = false;
  let time = 0;

  // ── 配置 ──────────────────────────────────────────
  const POINT_COUNT = 50;           // 网格节点数量
  const NEIGHBORS = 3;             // 每个点连接几个最近邻
  const MAX_EDGE_DIST = 240;       // 连线最大距离 (px)
  const NODE_RADIUS = 1.8;         // 节点半径
  const PARALLAX_STRENGTH = 20;    // 鼠标视差偏移量
  const DRIFT_AMP_MIN = 6;         // 漂移幅度下限
  const DRIFT_AMP_MAX = 24;        // 漂移幅度上限
  const DRIFT_SPEED_MIN = 0.003;   // 漂移速度下限
  const DRIFT_SPEED_MAX = 0.008;   // 漂移速度上限

  // 调色板：低饱和度暖琥珀色 / 淡棕色，匹配夕阳暖色调
  const PALETTE = [
    [190, 150, 110],   // warm amber
    [185, 140, 100],   // toasted brown
    [195, 160, 120],   // pale sand
  ];

  // ── 主题检测 ──────────────────────────────────────
  const isLightTheme = () => document.documentElement.dataset.theme === 'light';

  // ── 鼠标视差 ──────────────────────────────────────
  let mouseX = 0.5;
  let mouseY = 0.5;
  let paraX = 0;
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

  // ── 初始化基准点 ──────────────────────────────────
  function initPoints() {
    points = [];
    const margin = 50;
    for (let i = 0; i < POINT_COUNT; i++) {
      points.push({
        baseX: margin + Math.random() * (width - margin * 2),
        baseY: margin + Math.random() * (height - margin * 2),
        x: 0,
        y: 0,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amp: DRIFT_AMP_MIN + Math.random() * (DRIFT_AMP_MAX - DRIFT_AMP_MIN),
        speed: DRIFT_SPEED_MIN + Math.random() * (DRIFT_SPEED_MAX - DRIFT_SPEED_MIN),
      });
    }
  }

  // ── 构建边（基于基准位置的最近邻） ──────────────
  function buildEdges() {
    edges = [];
    const seen = new Set();

    for (let i = 0; i < points.length; i++) {
      const neighbors = [];

      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const dx = points[i].baseX - points[j].baseX;
        const dy = points[i].baseY - points[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_EDGE_DIST) {
          neighbors.push({ j, dist });
        }
      }

      // 取最近的 NEIGHBORS 个
      neighbors.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(NEIGHBORS, neighbors.length); k++) {
        const { j, dist } = neighbors[k];
        const key = Math.min(i, j) + '-' + Math.max(i, j);
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({
            i,
            j,
            baseDist: dist,
            colorIdx: (i + j) % PALETTE.length,
          });
        }
      }
    }
  }

  // ── 更新点位置（正弦漂移） ──────────────────────
  function updatePoints() {
    for (const p of points) {
      p.x = p.baseX + Math.sin(time * p.speed + p.phaseX) * p.amp;
      p.y = p.baseY + Math.cos(time * p.speed + p.phaseY) * p.amp;
    }
  }

  // ── 绘制一帧 ─────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(paraX, paraY);

    // 网格边线
    for (const e of edges) {
      const p1 = points[e.i];
      const p2 = points[e.j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 距离越近越不透明
      const distRatio = Math.min(dist / MAX_EDGE_DIST, 1);
      const alpha = (1 - distRatio) * 0.25;
      if (alpha < 0.02) continue;

      const [r, g, b] = PALETTE[e.colorIdx];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // 节点
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190, 150, 110, 0.35)';
      ctx.fill();
    }

    ctx.restore();
  }

  // ── 动画循环 ──────────────────────────────────────
  function animate() {
    if (!running) return;

    const targetX = (mouseX - 0.5) * PARALLAX_STRENGTH;
    const targetY = (mouseY - 0.5) * PARALLAX_STRENGTH;
    paraX += (targetX - paraX) * 0.05;
    paraY += (targetY - paraY) * 0.05;

    time += 1;
    updatePoints();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // ── 启停控制 ──────────────────────────────────────
  function start() {
    if (running) return;
    if (!isLightTheme()) return;
    running = true;
    resize();
    if (points.length === 0) {
      initPoints();
      buildEdges();
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
            if (!isLightTheme()) return;
            initPoints();
            buildEdges();
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
        const box = document.getElementById('loading-box');
        if (box && !box.classList.contains('loaded')) {
          if (isLightTheme()) {
            initPoints();
            buildEdges();
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

  // ── 启动（仅亮色主题） ────────────────────────────
  start();

  // ── PJAX 事件兜底 ─────────────────────────────────
  document.addEventListener('pjax:complete', () => {
    const box = document.getElementById('loading-box');
    if (box && !box.classList.contains('loaded') && isLightTheme()) {
      initPoints();
      buildEdges();
      start();
    }
  });
})();
