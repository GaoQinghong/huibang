/**
 * 慧邦生物 · 后台 API（Cloudflare Pages Functions）
 *
 * 需要在 Cloudflare Pages 项目里配置：
 *   KV 绑定    HUIBANG        → 一个 KV 命名空间（存内容和图片）
 *   环境变量   ADMIN_USER     → 管理员用户名
 *   环境变量   ADMIN_PASSWORD → 管理员初始密码（建议设为 Secret）
 *   环境变量   SESSION_SECRET → 任意长随机字符串，用于给登录票据签名
 *
 * 路由：
 *   POST /api/login      登录
 *   POST /api/logout     退出
 *   GET  /api/me         当前登录状态
 *   GET  /api/content    读取网站内容（公开）
 *   PUT  /api/content    保存网站内容（需登录）
 *   POST /api/password   修改密码（需登录）
 *   POST /api/upload     上传图片（需登录）
 *   GET  /api/image/:id  读取已上传图片（公开）
 */

const KEY_CONTENT = 'site:content';
const KEY_PASSWORD = 'auth:password';
const COOKIE = 'hb_session';
const SESSION_HOURS = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/* ---------- 小工具 ---------- */

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });

const bytesToHex = (buf) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

const enc = new TextEncoder();

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

/* 密码用 PBKDF2 加盐哈希后存 KV，不存明文 */
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256
  );
  return bytesToHex(bits);
}

/* 时间恒定比较，避免时序侧信道 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

/* 登录票据：  过期时间戳.签名  */
async function issueTicket(env) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  return exp + '.' + (await hmac(env.SESSION_SECRET, String(exp)));
}

async function isLoggedIn(request, env) {
  const ticket = readCookie(request, COOKIE);
  if (!ticket) return false;
  const [exp, sig] = ticket.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, exp));
}

function sessionCookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/* 校验当前密码：KV 里有改过的密码就用 KV 的，否则用环境变量里的初始密码 */
async function checkPassword(env, password) {
  const stored = await env.HUIBANG.get(KEY_PASSWORD, 'json');
  if (stored && stored.salt && stored.hash) {
    return safeEqual(await hashPassword(password, stored.salt), stored.hash);
  }
  return safeEqual(password, env.ADMIN_PASSWORD || '');
}

function missingConfig(env) {
  const miss = [];
  if (!env.HUIBANG) miss.push('KV 绑定 HUIBANG');
  if (!env.ADMIN_USER) miss.push('环境变量 ADMIN_USER');
  if (!env.ADMIN_PASSWORD) miss.push('环境变量 ADMIN_PASSWORD');
  if (!env.SESSION_SECRET) miss.push('环境变量 SESSION_SECRET');
  return miss;
}

/* ---------- 主入口 ---------- */

export async function onRequest(context) {
  const { request, env, params } = context;
  const route = (Array.isArray(params.route) ? params.route : [params.route || '']).join('/');
  const method = request.method.toUpperCase();

  try {
    /* 配置自检：让部署者一眼看到少配了什么 */
    if (route === 'health') {
      const miss = missingConfig(env);
      return json({ ok: miss.length === 0, missing: miss });
    }

    const miss = missingConfig(env);
    if (miss.length) {
      return json({ error: '后台尚未配置完成，缺少：' + miss.join('、'), missing: miss }, 503);
    }

    /* --- 读取内容：公开，前台页面也走这里 --- */
    if (route === 'content' && method === 'GET') {
      const saved = await env.HUIBANG.get(KEY_CONTENT);
      return new Response('{"content":' + (saved || 'null') + '}', {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' }
      });
    }

    /* --- 读取图片：公开 --- */
    if (route.startsWith('image/') && method === 'GET') {
      const id = route.slice('image/'.length);
      const obj = await env.HUIBANG.getWithMetadata('img:' + id, 'arrayBuffer');
      if (!obj || !obj.value) return json({ error: '图片不存在' }, 404);
      return new Response(obj.value, {
        headers: {
          'content-type': (obj.metadata && obj.metadata.type) || 'image/jpeg',
          'cache-control': 'public, max-age=31536000, immutable'
        }
      });
    }

    /* --- 登录 --- */
    if (route === 'login' && method === 'POST') {
      const { username, password } = await request.json().catch(() => ({}));
      const userOk = safeEqual(String(username || ''), env.ADMIN_USER);
      const passOk = await checkPassword(env, String(password || ''));
      if (!userOk || !passOk) {
        await new Promise((r) => setTimeout(r, 400)); // 减缓暴力猜测
        return json({ error: '用户名或密码不正确' }, 401);
      }
      return json({ ok: true }, 200, {
        'set-cookie': sessionCookie(await issueTicket(env), SESSION_HOURS * 3600)
      });
    }

    if (route === 'logout' && method === 'POST') {
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
    }

    if (route === 'me' && method === 'GET') {
      return json({ loggedIn: await isLoggedIn(request, env), user: env.ADMIN_USER });
    }

    /* --- 以下都需要登录 --- */
    if (!(await isLoggedIn(request, env))) {
      return json({ error: '未登录或登录已过期，请重新登录' }, 401);
    }

    if (route === 'content' && method === 'PUT') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object' || !body.catalog) {
        return json({ error: '内容格式不正确' }, 400);
      }
      const text = JSON.stringify(body);
      if (text.length > 2 * 1024 * 1024) return json({ error: '内容过大' }, 413);
      // 保存前留一份上一版，便于出错时回滚
      const prev = await env.HUIBANG.get(KEY_CONTENT);
      if (prev) await env.HUIBANG.put(KEY_CONTENT + ':prev', prev);
      await env.HUIBANG.put(KEY_CONTENT, text);
      return json({ ok: true, savedAt: new Date().toISOString() });
    }

    if (route === 'content/rollback' && method === 'POST') {
      const prev = await env.HUIBANG.get(KEY_CONTENT + ':prev');
      if (!prev) return json({ error: '没有可回滚的上一版本' }, 404);
      await env.HUIBANG.put(KEY_CONTENT, prev);
      return json({ ok: true });
    }

    if (route === 'password' && method === 'POST') {
      const { current, next } = await request.json().catch(() => ({}));
      if (!(await checkPassword(env, String(current || '')))) {
        return json({ error: '当前密码不正确' }, 401);
      }
      if (!next || String(next).length < 8) {
        return json({ error: '新密码至少 8 位' }, 400);
      }
      const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
      await env.HUIBANG.put(KEY_PASSWORD, JSON.stringify({
        salt, hash: await hashPassword(String(next), salt), changedAt: new Date().toISOString()
      }));
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
    }

    if (route === 'upload' && method === 'POST') {
      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') return json({ error: '没有收到文件' }, 400);
      if (!/^image\//.test(file.type)) return json({ error: '只能上传图片文件' }, 400);
      if (file.size > MAX_IMAGE_BYTES) return json({ error: '图片不能超过 5MB' }, 413);

      const buf = await file.arrayBuffer();
      const digest = bytesToHex(await crypto.subtle.digest('SHA-256', buf)).slice(0, 16);
      const ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.img'])[0].toLowerCase();
      const id = digest + ext;
      await env.HUIBANG.put('img:' + id, buf, { metadata: { type: file.type, name: file.name } });
      return json({ ok: true, url: '/api/image/' + id, id });
    }

    return json({ error: '接口不存在：' + method + ' /api/' + route }, 404);
  } catch (err) {
    return json({ error: '服务器内部错误：' + (err && err.message ? err.message : String(err)) }, 500);
  }
}
