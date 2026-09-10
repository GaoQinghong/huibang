/* 用 jsdom 加载真实后台页面，模拟真人点击，验证增删改 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const ROOT = require('path').resolve(__dirname, '..');

let saved = null;                 // 模拟服务端保存的内容
let uploadCount = 0;

function makeFetch(win) {
  return function (url, opts) {
    opts = opts || {};
    const m = String(url).replace(/^api\//, '');
    const body = opts.body && typeof opts.body === 'string' ? JSON.parse(opts.body) : null;
    let res;
    if (m === 'me') res = { loggedIn: true, user: 'admin' };
    else if (m === 'content' && (opts.method || 'GET') === 'GET') res = { content: saved };
    else if (m === 'content' && opts.method === 'PUT') { saved = body; res = { ok: true, savedAt: new Date().toISOString() }; }
    else if (m === 'upload') { uploadCount++; res = { ok: true, url: '/api/image/fake' + uploadCount + '.png', id: 'fake' + uploadCount + '.png' }; }
    else if (m === 'password') res = { ok: true };
    else if (m === 'logout') res = { ok: true };
    else res = { error: 'not found' };
    return Promise.resolve({ ok: !res.error, status: res.error ? 404 : 200, json: () => Promise.resolve(res) });
  };
}

async function boot() {
  const html = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://huibang-13v.pages.dev/admin.html' });
  const win = dom.window;
  win.fetch = makeFetch(win);
  win.confirm = () => true;                 // 删除确认一律同意
  win.alert = (m) => { throw new Error('弹出报错: ' + m); };
  win.scrollTo = () => {};
  win.eval(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'));
  win.eval(fs.readFileSync(path.join(ROOT, 'assets/js/admin.js'), 'utf8'));
  await new Promise(r => setTimeout(r, 60));  // 等 me + content 两次请求
  return win;
}

/* 工具 */
const results = [];
function check(name, cond, extra) {
  results.push(!!cond);
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '   ' + extra : ''));
}
const $ = (win, sel) => win.document.querySelector(sel);
const $$ = (win, sel) => [...win.document.querySelectorAll(sel)];
function click(win, el) {
  el.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
}
function typeIn(win, el, value) {
  el.value = value;
  el.dispatchEvent(new win.Event('input', { bubbles: true }));
}
function tabTo(win, name) {
  const b = $$(win, '.side button').find(b => b.textContent === name);
  click(win, b);
}
async function tick(ms) { await new Promise(r => setTimeout(r, ms || 40)); }

(async () => {
  const win = await boot();

  /* ---- 登录状态 ---- */
  check('已登录时直接进入后台', $(win, '#admin-view').style.display === 'block'
    && $(win, '#login-view').style.display === 'none');
  check('侧边栏 8 个栏目', $$(win, '.side button').length === 8);

  /* ================= 产品目录：增删改 ================= */
  tabTo(win, '产品目录');
  await tick();

  const catCount0 = $$(win, '#panel > div > .row').length;
  check('产品目录列出 12 个分类', catCount0 === 12, '实际 ' + catCount0);

  /* -- 改：修改第一个产品的名称 -- */
  const nameInput = $(win, '#panel input[data-c="0"][data-i="0"][data-f="name"]');
  check('能定位到产品名输入框', !!nameInput, nameInput ? '当前值 ' + nameInput.value : '');
  typeIn(win, nameInput, '到喜（改名测试）');
  click(win, $(win, '#save'));
  await tick(60);
  check('改：产品改名后保存生效',
    saved && saved.catalog[0].items[0].name === '到喜（改名测试）',
    '→ ' + (saved && saved.catalog[0].items[0].name));

  /* -- 改：修改规格 -- */
  tabTo(win, '产品目录'); await tick();
  typeIn(win, $(win, '#panel input[data-c="0"][data-i="0"][data-f="spec"]'), '9%测试规格');
  click(win, $(win, '#save')); await tick(60);
  check('改：产品规格保存生效', saved.catalog[0].items[0].spec === '9%测试规格');

  /* -- 增：在第一个分类里加产品 -- */
  tabTo(win, '产品目录'); await tick();
  const before = saved.catalog[0].items.length;
  click(win, $(win, '#panel button[data-a="additem"][data-c="0"]'));
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('增：新增产品后数量 +1',
    saved.catalog[0].items.length === before + 1,
    before + ' → ' + saved.catalog[0].items.length);

  /* -- 删：删掉刚加的产品 -- */
  tabTo(win, '产品目录'); await tick();
  const n1 = saved.catalog[0].items.length;
  const delBtns = $$(win, '#panel button[data-a="delitem"][data-c="0"]');
  click(win, delBtns[delBtns.length - 1]);
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('删：删除产品后数量 -1',
    saved.catalog[0].items.length === n1 - 1,
    n1 + ' → ' + saved.catalog[0].items.length);

  /* -- 排序：产品上移下移 -- */
  tabTo(win, '产品目录'); await tick();
  const first = saved.catalog[0].items[0].name, second = saved.catalog[0].items[1].name;
  click(win, $(win, '#panel button[data-a="downitem"][data-c="0"][data-i="0"]'));
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('排序：产品下移生效',
    saved.catalog[0].items[0].name === second && saved.catalog[0].items[1].name === first,
    first + ' ⇄ ' + second);

  tabTo(win, '产品目录'); await tick();
  click(win, $(win, '#panel button[data-a="upitem"][data-c="0"][data-i="1"]'));
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('排序：产品上移可还原', saved.catalog[0].items[0].name === first);

  /* -- 增：新增分类 -- */
  tabTo(win, '产品目录'); await tick();
  const nc = saved.catalog.length;
  click(win, $(win, '#panel button[data-a="addcat"]'));
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('增：新增分类后数量 +1', saved.catalog.length === nc + 1, nc + ' → ' + saved.catalog.length);
  check('新分类 id 唯一', new Set(saved.catalog.map(c => c.id)).size === saved.catalog.length);

  /* -- 删：删除刚加的分类 -- */
  tabTo(win, '产品目录'); await tick();
  const delCats = $$(win, '#panel button[data-a="delcat"]');
  click(win, delCats[delCats.length - 1]);
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('删：删除分类后数量还原', saved.catalog.length === nc);

  /* -- 产品详情编辑 -- */
  tabTo(win, '产品目录'); await tick();
  click(win, $(win, '#panel button[data-a="detail"][data-c="0"][data-i="0"]'));
  await tick();
  check('详情：能打开产品详情编辑页', /返回产品目录/.test($(win, '#panel').innerHTML));
  const featBtn = $$(win, '#panel button').find(b => /添加一条特点/.test(b.textContent));
  check('详情：有"添加特点"按钮', !!featBtn);
  const nf = saved.catalog[0].items[0].features ? saved.catalog[0].items[0].features.length : 0;
  click(win, featBtn); await tick();
  const areas = $$(win, '#panel textarea[data-i]');   // 特点列表的文本框带 data-i
  typeIn(win, areas[areas.length - 1], '这是测试新增的产品特点');
  check('详情：编辑特点后仍停留在详情页', /返回产品目录/.test($(win, '#panel').innerHTML));
  click(win, $(win, '#save')); await tick(60);
  check('详情：新增产品特点已保存',
    saved.catalog[0].items[0].features.slice(-1)[0] === '这是测试新增的产品特点',
    (nf) + ' → ' + saved.catalog[0].items[0].features.length + ' 条');

  /* ================= 公司证件：增删改 ================= */
  tabTo(win, '公司证件'); await tick();
  const c0 = saved.certs.current.length;
  const addCert = $$(win, '#panel button[data-a="add"]')[0];
  click(win, addCert); await tick();
  const certInputs = $$(win, '#panel input');
  typeIn(win, certInputs.find(i => i.value === '' && i.placeholder.includes('草甘膦')), '99% 测试证件');
  click(win, $(win, '#save')); await tick(60);
  check('证件：新增一项', saved.certs.current.length === c0 + 1 && saved.certs.current.includes('99% 测试证件'));

  tabTo(win, '公司证件'); await tick();
  const delCert = $$(win, '#panel button[data-a="del"]');
  click(win, delCert[delCert.length === 0 ? 0 : c0]);   // 删掉刚加的那条
  await tick();
  click(win, $(win, '#save')); await tick(60);
  check('证件：删除一项', saved.certs.current.length === c0, c0 + 1 + ' → ' + saved.certs.current.length);

  /* ================= 首页：改 ================= */
  tabTo(win, '首页'); await tick();
  const titleInput = $$(win, '#panel input').find(i => i.value === "灭生性除草剂专业厂家的先行者");
  check('首页：能找到主标题输入框', !!titleInput);
  if (titleInput) {
    typeIn(win, titleInput, '测试新标题');
    click(win, $(win, '#save')); await tick(60);
    check('首页：主标题修改已保存', saved.home.title === '测试新标题', '→ ' + saved.home.title);
  }

  /* 首页数据条增删 */
  tabTo(win, '首页'); await tick();
  const s0 = saved.home.stats.length;
  click(win, $(win, '#panel button[data-a="add"]')); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('首页：数据条新增', saved.home.stats.length === s0 + 1);
  tabTo(win, '首页'); await tick();
  const sd = $$(win, '#panel button[data-a="del"]');
  click(win, sd[sd.length - 1]); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('首页：数据条删除', saved.home.stats.length === s0);

  /* ================= 企业介绍：增删改 ================= */
  tabTo(win, '企业介绍'); await tick();
  const sec0 = saved.about.sections.length;
  click(win, $(win, '#panel button[data-a="addsec"]')); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('企业介绍：新增段落', saved.about.sections.length === sec0 + 1);
  tabTo(win, '企业介绍'); await tick();
  const secDel = $$(win, '#panel button[data-a="delsec"]');
  click(win, secDel[secDel.length - 1]); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('企业介绍：删除段落', saved.about.sections.length === sec0);

  /* ================= 企业画册：删 + 排序 ================= */
  tabTo(win, '企业画册'); await tick();
  const b0 = saved.brochure.length;
  const t0 = saved.brochure[0].title, t1 = saved.brochure[1].title;
  click(win, $(win, '#panel button[data-a="right"][data-i="0"]')); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('画册：右移排序生效', saved.brochure[0].title === t1 && saved.brochure[1].title === t0);

  tabTo(win, '企业画册'); await tick();
  click(win, $(win, '#panel button[data-a="del"][data-i="0"]')); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('画册：删除一页', saved.brochure.length === b0 - 1, b0 + ' → ' + saved.brochure.length);

  /* 画册标题改名 */
  tabTo(win, '企业画册'); await tick();
  typeIn(win, $(win, '#panel .thumb input[data-i="0"]'), '改名后的画册页');
  click(win, $(win, '#save')); await tick(60);
  check('画册：页面标题可改', saved.brochure[0].title === '改名后的画册页');

  /* ================= 联系我们：增删改 ================= */
  tabTo(win, '联系我们'); await tick();
  const k0 = saved.contact.cards.length;
  click(win, $(win, '#panel button[data-a="add"]')); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('联系我们：新增卡片', saved.contact.cards.length === k0 + 1);
  tabTo(win, '联系我们'); await tick();
  const kd = $$(win, '#panel button[data-a="del"]');
  click(win, kd[kd.length - 1]); await tick();
  click(win, $(win, '#save')); await tick(60);
  check('联系我们：删除卡片', saved.contact.cards.length === k0);

  /* ================= 公司信息：填电话邮箱 ================= */
  tabTo(win, '公司信息'); await tick();
  const inputs = $$(win, '#panel input');
  typeIn(win, inputs[4], '0530-8888888');
  typeIn(win, inputs[5], 'sales@huibang.com');
  click(win, $(win, '#save')); await tick(60);
  check('公司信息：电话邮箱可填写',
    saved.company.phone === '0530-8888888' && saved.company.email === 'sales@huibang.com');

  /* ================= 未保存提醒 ================= */
  tabTo(win, '公司信息'); await tick();
  typeIn(win, $$(win, '#panel input')[0], '临时改动');
  check('改动后出现未保存提示', /有未保存的修改/.test($(win, '#dirty').textContent));
  click(win, $(win, '#save')); await tick(60);
  check('保存后未保存提示消失', $(win, '#dirty').textContent === '');

  /* ================= 前台读取后台内容 ================= */
  check('保存的内容含全部 7 个栏目',
    ['company', 'home', 'about', 'certs', 'brochure', 'contact', 'catalog'].every(k => saved[k]),
    Object.keys(saved).join(','));

  const pass = results.filter(Boolean).length;
  console.log('\n' + pass + '/' + results.length + ' 项通过');
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('测试崩溃:', e); process.exit(1); });
