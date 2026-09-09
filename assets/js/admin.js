/* 慧邦生物 · 后台逻辑 */
(function () {
  'use strict';

  var data = null;      // 当前编辑中的内容
  var dirty = false;
  var tab = 'home';

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  function api(path, opts) {
    opts = opts || {};
    return fetch('api/' + path, {
      method: opts.method || 'GET',
      headers: opts.body && !(opts.body instanceof FormData) ? { 'content-type': 'application/json' } : undefined,
      body: opts.body instanceof FormData ? opts.body : (opts.body ? JSON.stringify(opts.body) : undefined)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || ('请求失败 ' + r.status));
        return j;
      });
    });
  }

  function markDirty() {
    dirty = true;
    $('dirty').textContent = '● 有未保存的修改';
  }

  /* ---------------- 登录 ---------------- */

  function showLogin(msg) {
    $('login-view').style.display = 'flex';
    $('admin-view').style.display = 'none';
    if (msg) {
      $('login-msg').textContent = msg;
      $('login-msg').className = 'msg err show';
    }
  }

  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('login-btn');
    btn.disabled = true;
    btn.textContent = '登录中…';
    api('login', { method: 'POST', body: { username: $('u').value, password: $('p').value } })
      .then(function () { location.reload(); })
      .catch(function (err) {
        $('login-msg').textContent = err.message;
        $('login-msg').className = 'msg err show';
        btn.disabled = false;
        btn.textContent = '登 录';
      });
  });

  $('logout').addEventListener('click', function () {
    api('logout', { method: 'POST' }).then(function () { location.reload(); });
  });

  /* ---------------- 启动 ---------------- */

  api('me')
    .then(function (r) {
      if (!r.loggedIn) { showLogin(); return; }
      return api('content').then(function (c) {
        data = (c.content && c.content.catalog) ? c.content : clone(DEFAULT_SITE);
        $('login-view').style.display = 'none';
        $('admin-view').style.display = 'block';
        renderSide();
        render();
      });
    })
    .catch(function (err) { showLogin(err.message); });

  /* ---------------- 侧边栏 ---------------- */

  var TABS = [
    { k: 'home', t: '首页' },
    { k: 'about', t: '企业介绍' },
    { k: 'certs', t: '公司证件' },
    { k: 'catalog', t: '产品目录' },
    { k: 'brochure', t: '企业画册' },
    { k: 'contact', t: '联系我们' },
    { k: 'company', t: '公司信息' },
    { k: 'password', t: '修改密码' }
  ];

  function renderSide() {
    $('side').innerHTML = TABS.map(function (x) {
      return '<button data-k="' + x.k + '"' + (x.k === tab ? ' class="on"' : '') + '>' + x.t + '</button>';
    }).join('');
    $('side').onclick = function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      tab = b.getAttribute('data-k');
      renderSide();
      render();
      window.scrollTo(0, 0);
    };
  }

  /* ---------------- 表单控件 ---------------- */

  /* 绑定一个输入框到 obj[key] */
  function field(label, obj, key, opts) {
    opts = opts || {};
    var id = 'f' + Math.random().toString(36).slice(2, 9);
    var v = esc(obj[key] || '');
    var input = opts.multiline
      ? '<textarea id="' + id + '" rows="' + (opts.rows || 3) + '">' + v + '</textarea>'
      : '<input id="' + id + '" type="' + (opts.type || 'text') + '" value="' + v + '">';
    setTimeout(function () {
      var el = $(id);
      if (el) el.addEventListener('input', function () { obj[key] = this.value; markDirty(); });
    }, 0);
    return '<div class="field"><label>' + esc(label) + '</label>' + input +
      (opts.hint ? '<div class="hint">' + esc(opts.hint) + '</div>' : '') + '</div>';
  }

  /* 图片选择：预览 + 上传 + 手填路径 */
  function imageField(label, obj, key) {
    var id = 'i' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var pv = $(id + 'p'), tx = $(id + 't'), fi = $(id + 'f'), st = $(id + 's');
      if (!tx) return;
      tx.addEventListener('input', function () { obj[key] = this.value; pv.src = this.value; markDirty(); });
      fi.addEventListener('change', function () {
        var f = this.files[0];
        if (!f) return;
        st.textContent = '上传中…';
        var fd = new FormData();
        fd.append('file', f);
        api('upload', { method: 'POST', body: fd })
          .then(function (r) {
            obj[key] = r.url; tx.value = r.url; pv.src = r.url;
            st.textContent = '上传成功'; markDirty();
          })
          .catch(function (e) { st.textContent = '上传失败：' + e.message; });
      });
    }, 0);
    return '<div class="field"><label>' + esc(label) + '</label><div class="imgpick">' +
      '<img class="prev" id="' + id + 'p" src="' + esc(obj[key] || '') + '" alt="">' +
      '<div class="ctl">' +
        '<input id="' + id + 't" type="text" value="' + esc(obj[key] || '') + '" placeholder="图片地址">' +
        '<div class="hint"><input id="' + id + 'f" type="file" accept="image/*" style="font-size:12.5px"> ' +
        '<span id="' + id + 's"></span></div>' +
      '</div></div></div>';
  }

  /* 字符串数组编辑器（证件清单、段落等） */
  function stringList(arr, placeholder, addText, multiline) {
    var id = 'l' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.oninput = function (e) {
        var i = e.target.getAttribute('data-i');
        if (i !== null) { arr[+i] = e.target.value; markDirty(); }
      };
      box.onclick = function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var i = +b.getAttribute('data-i');
        var act = b.getAttribute('data-a');
        if (act === 'del') arr.splice(i, 1);
        else if (act === 'up' && i > 0) arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
        else if (act === 'down' && i < arr.length - 1) arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
        else if (act === 'add') arr.push('');
        markDirty();
        render();
      };
    }, 0);
    var inner = arr.map(function (s, i) {
      var ctl = multiline
        ? '<textarea data-i="' + i + '" rows="3" style="flex:1;border:0;outline:none;background:none;resize:vertical">' + esc(s) + '</textarea>'
        : '<input data-i="' + i + '" value="' + esc(s) + '" placeholder="' + esc(placeholder || '') + '">';
      return '<div class="row' + (multiline ? '' : '') + '" style="display:flex;gap:10px;align-items:flex-start;padding:9px 12px;margin-bottom:8px">' +
        ctl +
        '<div class="acts">' +
          '<button class="iconbtn" data-a="up" data-i="' + i + '" title="上移">↑</button>' +
          '<button class="iconbtn" data-a="down" data-i="' + i + '" title="下移">↓</button>' +
          '<button class="iconbtn del" data-a="del" data-i="' + i + '" title="删除">✕</button>' +
        '</div></div>';
    }).join('');
    return '<div id="' + id + '">' + inner +
      '<button class="addbtn" data-a="add">＋ ' + esc(addText || '添加一项') + '</button></div>';
  }

  /* ---------------- 各面板 ---------------- */

  function render() {
    var p = $('panel');
    if (tab === 'home') return renderHome(p);
    if (tab === 'about') return renderAbout(p);
    if (tab === 'certs') return renderCerts(p);
    if (tab === 'catalog') return renderCatalog(p);
    if (tab === 'brochure') return renderBrochure(p);
    if (tab === 'contact') return renderContact(p);
    if (tab === 'company') return renderCompany(p);
    if (tab === 'password') return renderPassword(p);
  }

  function renderHome(p) {
    var h = data.home;
    var id = 'st' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.oninput = function (e) {
        var i = e.target.getAttribute('data-i'), f = e.target.getAttribute('data-f');
        if (i !== null && f) { h.stats[+i][f] = e.target.value; markDirty(); }
      };
      box.onclick = function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var a = b.getAttribute('data-a'), i = +b.getAttribute('data-i');
        if (a === 'del') h.stats.splice(i, 1);
        else if (a === 'add') h.stats.push({ n: '', label: '' });
        markDirty(); render();
      };
    }, 0);

    p.innerHTML = '<h2>首页<small>网站打开后看到的第一屏和数据条</small></h2>' +
      '<h4 style="margin-bottom:14px">首屏</h4>' +
      field('小标签（顶部英文）', h, 'tag') +
      field('主标题', h, 'title') +
      field('副标题', h, 'subtitle') +
      field('简介文字', h, 'lead', { multiline: true, rows: 3 }) +
      imageField('首屏背景图', h, 'heroImage') +
      '<h4 style="margin:26px 0 14px">数据条</h4>' +
      '<div id="' + id + '">' +
        h.stats.map(function (s, i) {
          return '<div class="row" style="display:flex;gap:10px;align-items:center;padding:9px 12px;margin-bottom:8px">' +
            '<input data-i="' + i + '" data-f="n" value="' + esc(s.n) + '" placeholder="数字" style="width:110px;border:1px solid var(--line);border-radius:7px;padding:6px 10px">' +
            '<input data-i="' + i + '" data-f="label" value="' + esc(s.label) + '" placeholder="说明" style="flex:1;border:1px solid var(--line);border-radius:7px;padding:6px 10px">' +
            '<button class="iconbtn del" data-a="del" data-i="' + i + '">✕</button></div>';
        }).join('') +
        '<button class="addbtn" data-a="add">＋ 添加一项数据</button>' +
      '</div>' +
      '<h4 style="margin:26px 0 14px">底部标语横幅</h4>' +
      field('标语', h, 'bannerTitle') +
      field('说明文字', h, 'bannerText', { multiline: true }) +
      imageField('横幅背景图', h, 'bannerImage');
  }

  function renderAbout(p) {
    var a = data.about;
    var id = 'ab' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.onclick = function (e) {
        var b = e.target.closest('button[data-a]');
        if (!b) return;
        var a2 = b.getAttribute('data-a'), i = +b.getAttribute('data-i');
        if (a2 === 'delsec') a.sections.splice(i, 1);
        else if (a2 === 'addsec') a.sections.push({ title: '新段落', paragraphs: [''] });
        else return;
        markDirty(); render();
      };
    }, 0);

    var vid = 'vl' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(vid);
      if (!box) return;
      box.oninput = function (e) {
        var i = e.target.getAttribute('data-i'), f = e.target.getAttribute('data-f');
        if (i !== null && f) { a.values[+i][f] = e.target.value; markDirty(); }
      };
      box.onclick = function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var act = b.getAttribute('data-a'), i = +b.getAttribute('data-i');
        if (act === 'del') a.values.splice(i, 1);
        else if (act === 'add') a.values.push({ k: '', v: '' });
        markDirty(); render();
      };
    }, 0);

    p.innerHTML = '<h2>企业介绍<small>首页「企业介绍」板块的文字与配图</small></h2>' +
      imageField('配图', a, 'image') +
      field('配图说明', a, 'imageCaption') +
      '<h4 style="margin:26px 0 14px">正文段落</h4>' +
      '<div id="' + id + '">' +
        a.sections.map(function (s, i) {
          return '<div class="row"><div class="row-head"><span class="t">段落 ' + (i + 1) + '</span>' +
            '<span class="sp"></span><div class="acts">' +
            '<button class="iconbtn del" data-a="delsec" data-i="' + i + '">✕</button></div></div>' +
            field('小标题', s, 'title') +
            '<label style="display:block;font-size:13.5px;color:var(--ink);font-weight:600;margin-bottom:6px">正文（每段一栏，可用 &lt;strong&gt; 加粗）</label>' +
            stringList(s.paragraphs, '段落文字', '添加一段', true) +
          '</div>';
        }).join('') +
        '<button class="addbtn" data-a="addsec">＋ 添加一个段落</button>' +
      '</div>' +
      '<h4 style="margin:26px 0 14px">理念卡片</h4>' +
      '<div id="' + vid + '">' +
        a.values.map(function (v, i) {
          return '<div class="row" style="display:flex;gap:10px;align-items:center;padding:9px 12px;margin-bottom:8px">' +
            '<input data-i="' + i + '" data-f="k" value="' + esc(v.k) + '" placeholder="标题" style="width:150px;border:1px solid var(--line);border-radius:7px;padding:6px 10px">' +
            '<input data-i="' + i + '" data-f="v" value="' + esc(v.v) + '" placeholder="内容" style="flex:1;border:1px solid var(--line);border-radius:7px;padding:6px 10px">' +
            '<button class="iconbtn del" data-a="del" data-i="' + i + '">✕</button></div>';
        }).join('') +
        '<button class="addbtn" data-a="add">＋ 添加一张卡片</button>' +
      '</div>';
  }

  function renderCerts(p) {
    var c = data.certs;
    p.innerHTML = '<h2>公司证件<small>首页「公司证件」板块的两份清单</small></h2>' +
      '<h4 style="margin-bottom:12px">公司证件</h4>' + stringList(c.current, '例：95% 草甘膦原药', '添加一项证件') +
      '<h4 style="margin:26px 0 12px">新登记证件</h4>' + stringList(c.registered, '例：8% 甲维盐可溶液剂', '添加一项证件') +
      '<h4 style="margin:26px 0 12px">配图</h4>' +
      imageField('证件页配图', c, 'image') + field('配图说明', c, 'imageCaption');
  }

  function renderCatalog(p) {
    var cats = data.catalog;
    var id = 'cg' + Math.random().toString(36).slice(2, 9);

    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.oninput = function (e) {
        var ci = e.target.getAttribute('data-c'), ii = e.target.getAttribute('data-i'),
            f = e.target.getAttribute('data-f');
        if (ci === null || !f) return;
        if (ii === null) cats[+ci][f] = e.target.value;
        else cats[+ci].items[+ii][f] = e.target.value;
        markDirty();
      };
      box.onclick = function (e) {
        var b = e.target.closest('button[data-a]');
        if (!b) return;
        var a = b.getAttribute('data-a'), ci = +b.getAttribute('data-c'), ii = +b.getAttribute('data-i');
        if (a === 'additem') cats[ci].items.push({ name: '新产品', spec: '', page: '' });
        else if (a === 'delitem') { if (!confirm('删除「' + cats[ci].items[ii].name + '」？')) return; cats[ci].items.splice(ii, 1); }
        else if (a === 'upitem' && ii > 0) cats[ci].items.splice(ii - 1, 0, cats[ci].items.splice(ii, 1)[0]);
        else if (a === 'downitem' && ii < cats[ci].items.length - 1) cats[ci].items.splice(ii + 1, 0, cats[ci].items.splice(ii, 1)[0]);
        else if (a === 'delcat') { if (!confirm('删除整个分类「' + cats[ci].name + '」及其下 ' + cats[ci].items.length + ' 款产品？')) return; cats.splice(ci, 1); }
        else if (a === 'upcat' && ci > 0) cats.splice(ci - 1, 0, cats.splice(ci, 1)[0]);
        else if (a === 'downcat' && ci < cats.length - 1) cats.splice(ci + 1, 0, cats.splice(ci, 1)[0]);
        else if (a === 'addcat') cats.push({ id: 'cat' + Date.now().toString(36), name: '新分类', en: '', page: '', items: [] });
        else if (a === 'detail') { openDetail(cats[ci].items[ii]); return; }
        else return;
        markDirty(); render();
      };
    }, 0);

    p.innerHTML = '<h2>产品目录<small>共 ' + cats.length + ' 个分类 · ' +
        cats.reduce(function (s, c) { return s + c.items.length; }, 0) +
        ' 款产品。产品顺序即网站上的显示顺序</small></h2>' +
      '<div id="' + id + '">' +
      cats.map(function (cat, ci) {
        return '<div class="row"><div class="row-head">' +
          '<span class="t">' + esc(cat.name) + '</span>' +
          '<span style="font-size:13px;color:#9aa39a">' + cat.items.length + ' 款</span>' +
          '<span class="sp"></span><div class="acts">' +
            '<button class="iconbtn" data-a="upcat" data-c="' + ci + '">↑</button>' +
            '<button class="iconbtn" data-a="downcat" data-c="' + ci + '">↓</button>' +
            '<button class="iconbtn del" data-a="delcat" data-c="' + ci + '">✕</button>' +
          '</div></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 90px;gap:10px;margin-bottom:14px">' +
            '<input data-c="' + ci + '" data-f="name" value="' + esc(cat.name) + '" placeholder="分类名" style="border:1px solid var(--line);border-radius:7px;padding:7px 11px">' +
            '<input data-c="' + ci + '" data-f="en" value="' + esc(cat.en || '') + '" placeholder="英文名" style="border:1px solid var(--line);border-radius:7px;padding:7px 11px">' +
            '<input data-c="' + ci + '" data-f="page" value="' + esc(cat.page || '') + '" placeholder="页码" style="border:1px solid var(--line);border-radius:7px;padding:7px 11px">' +
          '</div>' +
          cat.items.map(function (it, ii) {
            return '<div class="row sub" style="display:flex;gap:8px;align-items:center;padding:8px 10px;margin-bottom:7px">' +
              '<input data-c="' + ci + '" data-i="' + ii + '" data-f="page" value="' + esc(it.page || '') + '" placeholder="页" style="width:52px;border:1px solid var(--line);border-radius:6px;padding:5px 8px;text-align:center">' +
              '<input data-c="' + ci + '" data-i="' + ii + '" data-f="name" value="' + esc(it.name) + '" placeholder="产品名" style="width:150px;border:1px solid var(--line);border-radius:6px;padding:5px 8px">' +
              '<input data-c="' + ci + '" data-i="' + ii + '" data-f="spec" value="' + esc(it.spec || '') + '" placeholder="规格 / 有效成分" style="flex:1;min-width:80px;border:1px solid var(--line);border-radius:6px;padding:5px 8px">' +
              '<button class="btn ghost sm" data-a="detail" data-c="' + ci + '" data-i="' + ii + '">' +
                (it.features && it.features.length ? '详情✓' : '详情') + '</button>' +
              '<button class="iconbtn" data-a="upitem" data-c="' + ci + '" data-i="' + ii + '">↑</button>' +
              '<button class="iconbtn" data-a="downitem" data-c="' + ci + '" data-i="' + ii + '">↓</button>' +
              '<button class="iconbtn del" data-a="delitem" data-c="' + ci + '" data-i="' + ii + '">✕</button>' +
            '</div>';
          }).join('') +
          '<button class="addbtn" data-a="additem" data-c="' + ci + '">＋ 在「' + esc(cat.name) + '」中添加产品</button>' +
        '</div>';
      }).join('') +
      '<button class="addbtn" data-a="addcat" style="margin-top:6px">＋ 添加一个分类</button>' +
      '</div>';
  }

  /* 产品详情编辑（就地展开在面板顶部） */
  function openDetail(item) {
    var p = $('panel');
    if (!item.features) item.features = [];
    p.innerHTML = '<h2>' + esc(item.name) + '<small>' + esc(item.spec || '') +
        '　· 详情页内容，留空则该产品只显示名称和规格</small></h2>' +
      '<button class="btn ghost sm" id="back" style="margin-bottom:20px">← 返回产品目录</button>' +
      field('产品名', item, 'name') +
      field('规格 / 有效成分', item, 'spec') +
      field('画册页码', item, 'page') +
      field('一句话卖点（红色大字）', item, 'tagline') +
      imageField('产品图', item, 'image') +
      '<h4 style="margin:26px 0 12px">产品特点</h4>' +
      stringList(item.features, '一条特点', '添加一条特点', true) +
      field('使用方法 / 注药适期', item, 'usage', { multiline: true }) +
      field('规格包装', item, 'packing', { hint: '例：20毫升*150瓶　30毫升*150瓶' });
    $('back').onclick = function () { render(); };
  }

  function renderBrochure(p) {
    var b = data.brochure;
    var id = 'br' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.oninput = function (e) {
        var i = e.target.getAttribute('data-i');
        if (i !== null) { b[+i].title = e.target.value; markDirty(); }
      };
      box.onclick = function (e) {
        var btn = e.target.closest('button[data-a]');
        if (!btn) return;
        var a = btn.getAttribute('data-a'), i = +btn.getAttribute('data-i');
        if (a === 'del') { if (!confirm('从画册中移除这一页？')) return; b.splice(i, 1); }
        else if (a === 'left' && i > 0) b.splice(i - 1, 0, b.splice(i, 1)[0]);
        else if (a === 'right' && i < b.length - 1) b.splice(i + 1, 0, b.splice(i, 1)[0]);
        else return;
        markDirty(); render();
      };
      var fi = $(id + 'file');
      fi.onchange = function () {
        var files = [].slice.call(this.files);
        if (!files.length) return;
        var st = $(id + 'st');
        st.textContent = '上传中 0/' + files.length;
        var n = 0;
        files.reduce(function (chain, f) {
          return chain.then(function () {
            var fd = new FormData();
            fd.append('file', f);
            return api('upload', { method: 'POST', body: fd }).then(function (r) {
              b.push({ src: r.url, title: f.name.replace(/\.[^.]+$/, '') });
              st.textContent = '上传中 ' + (++n) + '/' + files.length;
            });
          });
        }, Promise.resolve())
          .then(function () { markDirty(); render(); })
          .catch(function (e) { st.textContent = '上传失败：' + e.message; });
      };
    }, 0);

    p.innerHTML = '<h2>企业画册<small>共 ' + b.length + ' 页。顺序即网站上的展示顺序</small></h2>' +
      '<div class="field"><label>上传新页面（可一次选多张）</label>' +
        '<input id="' + id + 'file" type="file" accept="image/*" multiple>' +
        '<div class="hint" id="' + id + 'st">单张不超过 5MB</div></div>' +
      '<div id="' + id + '"><div class="thumbs">' +
        b.map(function (x, i) {
          return '<div class="thumb"><img src="' + esc(x.src) + '" alt=""><div class="cap">' +
            '<input data-i="' + i + '" value="' + esc(x.title) + '" placeholder="页面标题">' +
            '<div class="acts" style="display:flex;gap:6px;justify-content:center;margin-top:6px">' +
              '<button class="iconbtn" data-a="left" data-i="' + i + '">←</button>' +
              '<button class="iconbtn" data-a="right" data-i="' + i + '">→</button>' +
              '<button class="iconbtn del" data-a="del" data-i="' + i + '">✕</button>' +
            '</div></div></div>';
        }).join('') +
      '</div></div>';
  }

  function renderContact(p) {
    var cards = data.contact.cards;
    var id = 'ct' + Math.random().toString(36).slice(2, 9);
    setTimeout(function () {
      var box = $(id);
      if (!box) return;
      box.onclick = function (e) {
        var b = e.target.closest('button[data-a]');
        if (!b) return;
        var a = b.getAttribute('data-a'), i = +b.getAttribute('data-i');
        if (a === 'del') cards.splice(i, 1);
        else if (a === 'add') cards.push({ icon: '📍', title: '', line1: '', line2: '' });
        else return;
        markDirty(); render();
      };
    }, 0);
    p.innerHTML = '<h2>联系我们<small>联系页上方的三张卡片。电话邮箱请在「公司信息」里填</small></h2>' +
      '<div id="' + id + '">' +
        cards.map(function (c, i) {
          return '<div class="row"><div class="row-head"><span class="t">卡片 ' + (i + 1) + '</span>' +
            '<span class="sp"></span><button class="iconbtn del" data-a="del" data-i="' + i + '">✕</button></div>' +
            '<div class="grid2">' + field('图标（emoji）', c, 'icon') + field('标题', c, 'title') + '</div>' +
            field('第一行', c, 'line1') +
            field('第二行（说明）', c, 'line2', { hint: '换行请用 <br>' }) +
          '</div>';
        }).join('') +
        '<button class="addbtn" data-a="add">＋ 添加一张卡片</button>' +
      '</div>';
  }

  function renderCompany(p) {
    var c = data.company;
    p.innerHTML = '<h2>公司信息<small>页脚和联系页共用，改一处全站生效</small></h2>' +
      field('生产企业名称', c, 'factory') +
      field('销售公司名称', c, 'service') +
      field('企业标语', c, 'slogan') +
      field('公司地址', c, 'address') +
      field('联系电话', c, 'phone', { hint: '填写后会显示在页脚和联系页' }) +
      field('电子邮箱', c, 'email');
  }

  function renderPassword(p) {
    p.innerHTML = '<h2>修改密码<small>修改后需要用新密码重新登录</small></h2>' +
      '<div class="msg" id="pw-msg"></div>' +
      '<div style="max-width:380px">' +
        '<div class="field"><label>当前密码</label><input id="pw0" type="password" autocomplete="current-password"></div>' +
        '<div class="field"><label>新密码</label><input id="pw1" type="password" autocomplete="new-password">' +
          '<div class="hint">至少 8 位</div></div>' +
        '<div class="field"><label>确认新密码</label><input id="pw2" type="password" autocomplete="new-password"></div>' +
        '<button class="btn" id="pw-go">修改密码</button>' +
      '</div>';
    $('pw-go').onclick = function () {
      var msg = $('pw-msg');
      if ($('pw1').value !== $('pw2').value) {
        msg.className = 'msg err show'; msg.textContent = '两次输入的新密码不一致'; return;
      }
      api('password', { method: 'POST', body: { current: $('pw0').value, next: $('pw1').value } })
        .then(function () {
          msg.className = 'msg ok show';
          msg.textContent = '密码已修改，3 秒后请用新密码重新登录…';
          setTimeout(function () { location.reload(); }, 3000);
        })
        .catch(function (e) { msg.className = 'msg err show'; msg.textContent = e.message; });
    };
  }

  /* ---------------- 保存 ---------------- */

  $('save').onclick = function () {
    var btn = this;
    btn.disabled = true;
    btn.textContent = '保存中…';
    api('content', { method: 'PUT', body: data })
      .then(function (r) {
        dirty = false;
        $('dirty').textContent = '';
        $('saveinfo').textContent = '已保存 ' + new Date(r.savedAt).toLocaleString('zh-CN');
        btn.textContent = '✓ 已发布';
        setTimeout(function () { btn.textContent = '保存并发布'; btn.disabled = false; }, 1600);
      })
      .catch(function (e) {
        alert('保存失败：' + e.message);
        btn.textContent = '保存并发布';
        btn.disabled = false;
      });
  };

  $('reload').onclick = function () {
    if (dirty && !confirm('放弃所有未保存的修改？')) return;
    location.reload();
  };

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });
})();
