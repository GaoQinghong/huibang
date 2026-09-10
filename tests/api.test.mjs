import { onRequest } from '../functions/api/[[route]].js';

/* 模拟 Cloudflare KV */
function makeKV() {
  const m = new Map();
  return {
    _m: m,
    async get(k, type) {
      const v = m.get(k);
      if (v === undefined) return null;
      if (type === 'json') return JSON.parse(v.value);
      if (type === 'arrayBuffer') return v.value;
      return v.value;
    },
    async getWithMetadata(k) { return m.get(k) || { value: null, metadata: null }; },
    async put(k, value, opts) { m.set(k, { value, metadata: opts && opts.metadata }); }
  };
}

const KV = makeKV();
const env = { HUIBANG: KV, ADMIN_USER: 'admin', ADMIN_PASSWORD: 'Huibang@2026', SESSION_SECRET: 'test-secret-xyz' };

let cookie = '';
async function call(path, { method = 'GET', body, form, useCookie = true } = {}) {
  const headers = {};
  if (useCookie && cookie) headers.cookie = cookie;
  if (body) headers['content-type'] = 'application/json';
  const req = new Request('https://x.pages.dev/api/' + path, {
    method, headers, body: form ? form : (body ? JSON.stringify(body) : undefined)
  });
  const res = await onRequest({ request: req, env, params: { route: path.split('/') } });
  const sc = res.headers.get('set-cookie');
  if (sc && useCookie) cookie = sc.split(';')[0];
  const ct = res.headers.get('content-type') || '';
  const out = ct.includes('json') ? await res.json() : await res.arrayBuffer();
  return { status: res.status, body: out };
}

const results = [];
const check = (name, cond, extra = '') => {
  results.push(cond);
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
};

/* 1. 健康检查 */
let r = await call('health');
check('健康检查配置完整', r.body.ok === true);

/* 2. 未登录不能保存 */
r = await call('content', { method: 'PUT', body: { catalog: [] } });
check('未登录保存被拒绝', r.status === 401, '→ ' + r.body.error);

/* 3. 错误密码 */
r = await call('login', { method: 'POST', body: { username: 'admin', password: 'wrong' }, useCookie: false });
check('错误密码被拒绝', r.status === 401);

/* 4. 错误用户名 */
r = await call('login', { method: 'POST', body: { username: 'root', password: 'Huibang@2026' }, useCookie: false });
check('错误用户名被拒绝', r.status === 401);

/* 5. 正确登录 */
r = await call('login', { method: 'POST', body: { username: 'admin', password: 'Huibang@2026' } });
check('正确密码登录成功', r.status === 200 && cookie.startsWith('hb_session='));

/* 6. 登录状态 */
r = await call('me');
check('登录状态可查询', r.body.loggedIn === true);

/* 7. 保存内容 */
const site = { company: { factory: '巨野县韦恩生物科技有限公司' }, catalog: [{ id: 'a', name: '测试分类', items: [{ name: '到喜', spec: '8%甲维盐' }] }] };
r = await call('content', { method: 'PUT', body: site });
check('登录后保存成功', r.status === 200 && r.body.ok);

/* 8. 读回内容（公开） */
r = await call('content', { useCookie: false });
check('内容可公开读取', r.body.content && r.body.content.catalog[0].name === '测试分类');

/* 9. 二次保存 + 回滚 */
await call('content', { method: 'PUT', body: { ...site, catalog: [{ id: 'b', name: '改后分类', items: [] }] } });
r = await call('content', { useCookie: false });
check('内容可更新', r.body.content.catalog[0].name === '改后分类');
r = await call('content/rollback', { method: 'POST' });
check('回滚接口可用', r.status === 200);
r = await call('content', { useCookie: false });
check('回滚后恢复上一版', r.body.content.catalog[0].name === '测试分类');

/* 10. 格式校验 */
r = await call('content', { method: 'PUT', body: { nonsense: 1 } });
check('非法内容被拒绝', r.status === 400);

/* 11. 图片上传 + 读取 */
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);
const fd = new FormData();
fd.append('file', new File([png], 'logo.png', { type: 'image/png' }));
r = await call('upload', { method: 'POST', form: fd });
check('图片上传成功', r.status === 200 && /^\/api\/image\//.test(r.body.url), '→ ' + r.body.url);
const imgId = r.body.id;
r = await call('image/' + imgId, { useCookie: false });
check('图片可公开读取', r.status === 200 && r.body.byteLength === png.length);

/* 12. 非图片被拒 */
const fd2 = new FormData();
fd2.append('file', new File(['x'], 'a.exe', { type: 'application/octet-stream' }));
r = await call('upload', { method: 'POST', form: fd2 });
check('非图片文件被拒绝', r.status === 400);

/* 13. 改密码 */
r = await call('password', { method: 'POST', body: { current: 'Huibang@2026', next: 'short' } });
check('过短新密码被拒绝', r.status === 400);
r = await call('password', { method: 'POST', body: { current: 'wrongold', next: 'NewPass2026!' } });
check('错误旧密码被拒绝', r.status === 401);
r = await call('password', { method: 'POST', body: { current: 'Huibang@2026', next: 'NewPass2026!' } });
check('密码修改成功', r.status === 200);

/* 14. 新密码生效、旧密码失效 */
cookie = '';
r = await call('login', { method: 'POST', body: { username: 'admin', password: 'Huibang@2026' }, useCookie: false });
check('改密后旧密码失效', r.status === 401);
r = await call('login', { method: 'POST', body: { username: 'admin', password: 'NewPass2026!' } });
check('改密后新密码可登录', r.status === 200);

/* 15. 伪造 cookie */
cookie = 'hb_session=99999999999999.deadbeef';
r = await call('content', { method: 'PUT', body: { catalog: [] } });
check('伪造登录票据被拒绝', r.status === 401);

/* 16. 过期票据 */
cookie = 'hb_session=1000000000000.abc';
r = await call('me');
check('过期票据判定为未登录', r.body.loggedIn === false);

/* 17. 缺配置时提示 */
const bad = { HUIBANG: KV, ADMIN_USER: 'a' };
const res = await onRequest({ request: new Request('https://x/api/content'), env: bad, params: { route: ['content'] } });
const bj = await res.json();
check('缺配置时给出明确提示', res.status === 503 && bj.missing.length === 2, '→ 缺 ' + bj.missing.join('、'));

const pass = results.filter(Boolean).length;
console.log('\n' + pass + '/' + results.length + ' 项通过');
process.exit(pass === results.length ? 0 : 1);
