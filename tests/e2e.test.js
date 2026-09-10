/* 端到端：后台保存的内容 → 前台页面能否正确显示 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..');
const read = f => fs.readFileSync(ROOT + '/' + f, 'utf8');

/* 模拟后台已保存的一份被大改过的内容 */
const backendContent = JSON.parse(JSON.stringify(
  new Function(read('assets/js/data.js') + '; return DEFAULT_SITE;')()
));
backendContent.home.title = '后台改过的新标题';
backendContent.company.phone = '0530-8888888';
backendContent.company.email = 'sales@huibang.com';
backendContent.certs.current.push('99% 后台新增的证件');
backendContent.catalog[0].items.push({ name: '后台新增产品', spec: '10%测试悬浮剂', page: '99' });
backendContent.catalog.push({ id: 'newcat', name: '后台新增分类', en: 'NEW', page: '77',
  items: [{ name: '新分类里的产品', spec: '5%测试剂', page: '77' }] });
backendContent.brochure.push({ src: '/api/image/x.png', title: '后台上传的画册页' });

const results = [];
const check = (n, c, e) => { results.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (e ? '   ' + e : '')); };

async function loadPage(file, url, hasApi) {
  const dom = new JSDOM(read(file), { runScripts: 'outside-only', url });
  const win = dom.window;
  win.fetch = () => hasApi
    ? Promise.resolve({ ok: true, json: () => Promise.resolve({ content: backendContent }) })
    : Promise.reject(new Error('无后台'));
  win.scrollTo = () => {};
  win.eval(read('assets/js/data.js'));
  win.eval(read('assets/js/main.js'));
  const inline = [...read(file).matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  win.eval(inline);
  await new Promise(r => setTimeout(r, 80));
  return win;
}

(async () => {
  const base = 'https://huibang-13v.pages.dev/';

  /* --- 有后台时：前台应显示后台内容 --- */
  let w = await loadPage('index.html', base, true);
  let t = w.document.body.textContent;
  check('首页显示后台改的标题', t.includes('后台改过的新标题'));
  check('首页显示后台新增的证件', t.includes('99% 后台新增的证件'));
  check('首页显示后台新增的分类', t.includes('后台新增分类'));
  check('页脚显示后台填的电话', t.includes('0530-8888888'));
  check('页脚显示后台填的邮箱', t.includes('sales@huibang.com'));

  w = await loadPage('catalog.html', base + 'catalog.html', true);
  t = w.document.body.textContent;
  check('目录页显示后台新增的产品', t.includes('后台新增产品'));
  check('目录页显示后台新增的分类', t.includes('后台新增分类'));
  const links = [...w.document.querySelectorAll('a.pitem')];
  check('目录页每条产品都是可点链接', links.length === 88, links.length + ' 条');
  check('新增产品的链接指向详情页',
    links.some(a => /product\.html\?id=newcat-1/.test(a.getAttribute('href'))));

  w = await loadPage('product.html', base + 'product.html?id=newcat-1', true);
  t = w.document.body.textContent;
  check('后台新增产品的详情页可打开', t.includes('新分类里的产品') && t.includes('5%测试剂'));

  w = await loadPage('contact.html', base + 'contact.html', true);
  t = w.document.body.textContent;
  check('联系页显示后台填的电话', t.includes('0530-8888888'));

  w = await loadPage('brochure.html', base + 'brochure.html', true);
  t = w.document.body.textContent;
  check('画册页显示后台上传的新页', t.includes('后台上传的画册页'));

  /* --- 后台挂掉时：应回退到默认内容，不能白屏 --- */
  w = await loadPage('index.html', base, false);
  t = w.document.body.textContent;
  check('后台不可用时首页仍正常显示', t.includes('灭生性除草剂专业厂家的先行者') && t.length > 800,
    '页面文字 ' + t.length + ' 字');
  check('后台不可用时不显示后台内容', !t.includes('后台改过的新标题'));

  w = await loadPage('catalog.html', base + 'catalog.html', false);
  check('后台不可用时目录仍有 86 款产品',
    w.document.querySelectorAll('a.pitem').length === 86);

  /* --- XSS 防护 --- */
  const evil = JSON.parse(JSON.stringify(backendContent));
  evil.home.title = '<img src=x onerror="window.__hacked=1">';
  evil.company.phone = '"><script>window.__hacked=1</script>';
  const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', url: base });
  const win = dom.window;
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ content: evil }) });
  win.scrollTo = () => {};
  win.eval(read('assets/js/data.js'));
  win.eval(read('assets/js/main.js'));
  win.eval([...read('index.html').matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'));
  await new Promise(r => setTimeout(r, 80));
  check('恶意内容被转义，未执行脚本', !win.__hacked && win.document.body.textContent.includes('<img src=x'));

  const pass = results.filter(Boolean).length;
  console.log('\n' + pass + '/' + results.length + ' 项通过');
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('崩溃:', e); process.exit(1); });
