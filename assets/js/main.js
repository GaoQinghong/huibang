/* 慧邦生物 · 公共脚本：导航、页脚、移动端菜单 */
(function () {
  var NAV = [
    { href: 'index.html', key: 'home', text: '首页' },
    { href: 'index.html#about', key: 'about', text: '企业介绍' },
    { href: 'index.html#certs', key: 'certs', text: '公司证件' },
    { href: 'catalog.html', key: 'catalog', text: '产品目录' },
    { href: 'brochure.html', key: 'brochure', text: '企业画册' },
    { href: 'contact.html', key: 'contact', text: '联系我们' }
  ];

  var page = document.body.getAttribute('data-page') || '';

  var navHtml =
    '<header class="nav"><div class="wrap">' +
      '<a class="logo" href="index.html">' +
        '<span class="logo-mark">慧</span>' +
        '<span class="logo-txt"><b>慧邦生物</b><span>HUIBANG</span></span>' +
      '</a>' +
      '<button class="burger" id="burger" aria-label="菜单">☰</button>' +
      '<nav class="menu" id="menu">' +
        NAV.map(function (n) {
          return '<a href="' + n.href + '"' + (n.key === page ? ' class="on"' : '') + '>' + n.text + '</a>';
        }).join('') +
      '</nav>' +
    '</div></header>';

  var footHtml =
    '<footer class="foot"><div class="wrap"><div class="cols">' +
      '<div>' +
        '<h5>' + COMPANY.factory + '</h5>' +
        '<h5 style="margin-top:-6px">' + COMPANY.service + '</h5>' +
        '<p>' + COMPANY.slogan + '</p>' +
        '<p>国家农业部核准的高科技生物环保型农药定点企业</p>' +
      '</div>' +
      '<div><h5>快速导航</h5><ul>' +
        NAV.map(function (n) { return '<li><a href="' + n.href + '">' + n.text + '</a></li>'; }).join('') +
      '</ul></div>' +
      '<div><h5>联系我们</h5>' +
        '<p>地址：' + COMPANY.address + '</p>' +
        (COMPANY.phone ? '<p>电话：' + COMPANY.phone + '</p>' : '') +
        (COMPANY.email ? '<p>邮箱：' + COMPANY.email + '</p>' : '') +
        '<p><a href="contact.html">查看详细联系方式 →</a></p>' +
      '</div>' +
    '</div><div class="copy">© ' + new Date().getFullYear() + ' ' + COMPANY.factory + ' · ' + COMPANY.service + '　保留所有权利</div>' +
    '</div></footer>';

  var h = document.getElementById('site-nav');
  if (h) h.outerHTML = navHtml;
  var f = document.getElementById('site-foot');
  if (f) f.outerHTML = footHtml;

  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.getElementById('menu').classList.toggle('open');
    });
  }
})();

/* 产品条目 HTML（目录页与详情页复用） */
function productItemHtml(item) {
  return '<a class="pitem" href="product.html?id=' + item.id + '">' +
    '<span class="pg">' + item.page + '</span>' +
    '<span class="nm">' + item.name + '</span>' +
    '<span class="sp">' + item.spec + '</span>' +
    (item.features ? '<span class="badge">详情</span>' : '') +
    '<span class="go">→</span>' +
  '</a>';
}
