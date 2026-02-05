(function () {
  var imgs = [
    'https://607163943.github.io/images/index-top.jpg',
    'https://607163943.github.io/images/index-top2.jpeg',
    'https://607163943.github.io/images/index-top3.jpg'
  ];

  function isHomePage() {
    // Butterfly 首页通常会有 recent-posts 容器（文章列表）
    // 只要这个存在，就认为是首页；分类/标签/文章页一般不存在
    return document.querySelector('#recent-posts, .recent-posts');
  }

  function applyHomeBanner() {
    var header = document.getElementById('page-header');
    if (!header) return;

    if (!isHomePage()) {
      // 非首页：如果之前是我们改过的，撤销（避免覆盖分类/标签页自己的 header）
      if (header.dataset.homeRandomBanner === '1') {
        header.style.backgroundImage = '';
        header.style.backgroundSize = '';
        header.style.backgroundPosition = '';
        delete header.dataset.homeRandomBanner;
      }
      return;
    }

    // 首页：随机设置
    var idx = Math.floor(Math.random() * imgs.length);
    header.style.backgroundImage = 'url(' + imgs[idx] + ')';
    header.style.backgroundSize = 'cover';
    header.style.backgroundPosition = 'center';
    header.dataset.homeRandomBanner = '1';
  }

  // 首次加载
  applyHomeBanner()
})();