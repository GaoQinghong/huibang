/* 慧邦生物 · 前台公共脚本
 * 1) 从后台 API 拉取内容（拉不到就用 data.js 里的默认内容）
 * 2) 渲染导航与页脚
 * 3) 内容就绪后执行各页面通过 ready() 注册的渲染函数
 */

var _readyQueue = [];
var _booted = false;

/** 注册页面渲染函数，内容就绪后自动执行 */
function ready(fn) {
  if (_booted) fn();
  else _readyQueue.push(fn);
}

/* HTML 转义，用于所有来自后台的纯文本字段 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var NAV_LINKS = [
  { href: 'index.html', key: 'home', text: '首页' },
  { href: 'index.html#about', key: 'about', text: '企业介绍' },
  { href: 'index.html#certs', key: 'certs', text: '公司证件' },
  { href: 'catalog.html', key: 'catalog', text: '产品目录' },
  { href: 'brochure.html', key: 'brochure', text: '企业画册' },
  { href: 'contact.html', key: 'contact', text: '联系我们' }
];

function renderChrome() {
  var page = document.body.getAttribute('data-page') || '';
  var c = SITE.company || {};

  var nav =
    '<header class="nav"><div class="wrap">' +
      '<a class="logo" href="index.html">' +
        '<span class="logo-mark">慧</span>' +
        '<span class="logo-txt"><b>慧邦生物</b><span>HUIBANG</span></span>' +
      '</a>' +
      '<button class="burger" id="burger" aria-label="菜单">☰</button>' +
      '<nav class="menu" id="menu">' +
        NAV_LINKS.map(function (n) {
          return '<a href="' + n.href + '"' + (n.key === page ? ' class="on"' : '') + '>' + n.text + '</a>';
        }).join('') +
      '</nav>' +
    '</div></header>';

  var foot =
    '<footer class="foot"><div class="wrap"><div class="cols">' +
      '<div>' +
        '<h5>' + esc(c.factory) + '</h5>' +
        '<h5 style="margin-top:-6px">' + esc(c.service) + '</h5>' +
        '<p>' + esc(c.slogan) + '</p>' +
        '<p>国家农业部核准的高科技生物环保型农药定点企业</p>' +
      '</div>' +
      '<div><h5>快速导航</h5><ul>' +
        NAV_LINKS.map(function (n) { return '<li><a href="' + n.href + '">' + n.text + '</a></li>'; }).join('') +
      '</ul></div>' +
      '<div><h5>联系我们</h5>' +
        '<p>地址：' + esc(c.address) + '</p>' +
        (c.phone ? '<p>电话：' + esc(c.phone) + '</p>' : '') +
        (c.email ? '<p>邮箱：' + esc(c.email) + '</p>' : '') +
        '<p><a href="contact.html">查看详细联系方式 →</a></p>' +
      '</div>' +
    '</div><div class="copy">© ' + new Date().getFullYear() + ' ' +
      esc(c.factory) + ' · ' + esc(c.service) + '　保留所有权利</div>' +
    '</div></footer>';

  var h = document.getElementById('site-nav');
  if (h) h.outerHTML = nav;
  var f = document.getElementById('site-foot');
  if (f) f.outerHTML = foot;

  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.getElementById('menu').classList.toggle('open');
    });
  }
}

/** 产品条目 HTML（目录页与详情页复用） */
function productItemHtml(item) {
  return '<a class="pitem" href="product.html?id=' + encodeURIComponent(item.id) + '">' +
    '<span class="pg">' + esc(item.page) + '</span>' +
    '<span class="nm">' + esc(item.name) + '</span>' +
    '<span class="sp">' + esc(item.spec) + '</span>' +
    (item.features && item.features.length ? '<span class="badge">详情</span>' : '') +
    '<span class="go">→</span>' +
  '</a>';
}

/* ---------- 启动：先取后台内容，再渲染 ---------- */
function boot() {
  if (_booted) return;
  _booted = true;
  indexCatalog(SITE.catalog);
  renderChrome();
  _readyQueue.forEach(function (fn) {
    try { fn(); } catch (e) { if (window.console) console.error('页面渲染出错', e); }
  });
  _readyQueue = [];
}

(function () {
  var done = false;
  var finish = function () { if (!done) { done = true; boot(); } };

  // 后台无响应时最多等 3.5 秒，之后直接用默认内容渲染，保证页面一定出得来
  var timer = setTimeout(finish, 3500);

  fetch('api/content', { headers: { accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.content && data.content.catalog) {
        // 顶层字段以后台内容为准，后台没有的字段沿用默认内容
        var merged = {};
        Object.keys(DEFAULT_SITE).forEach(function (k) { merged[k] = DEFAULT_SITE[k]; });
        Object.keys(data.content).forEach(function (k) {
          if (data.content[k] != null) merged[k] = data.content[k];
        });
        SITE = merged;
      }
    })
    .catch(function () { /* 静态托管或后台未配置：保持默认内容 */ })
    .then(function () { clearTimeout(timer); finish(); });
})();
