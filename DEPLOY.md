# 后台配置说明（Cloudflare Pages）

网站已经能访问了，但**后台需要再配置 4 项**才能登录。全部在 Cloudflare 网页上点，约 5 分钟。

## 一、创建 KV 存储（放内容和图片）

1. Cloudflare 左侧菜单 → **Storage & Databases** → **KV**
2. 点 **Create instance / 创建**，名字填 `huibang-data`，确定

## 二、把 KV 绑定到网站

1. 左侧 **Compute (Workers)** → **Workers & Pages** → 点开 **huibang-13v**
2. 顶部 **Settings（设置）** → 找到 **Bindings（绑定）** → **Add** → 选 **KV namespace**
3. 填写：
   - Variable name（变量名）：**`HUIBANG`** ← 必须一字不差，全大写
   - KV namespace：选刚才建的 `huibang-data`
4. 保存

## 三、设置 3 个环境变量

还在 **Settings** 页，找到 **Variables and Secrets（变量与机密）** → **Add**，添加 3 条：

| 变量名 | 值 | 类型 |
|---|---|---|
| `ADMIN_USER` | 你要的管理员用户名，例如 `admin` | Text |
| `ADMIN_PASSWORD` | 你要的初始密码（建议 12 位以上，字母+数字+符号） | **Secret** |
| `SESSION_SECRET` | 一长串随机字符（30 位以上，随便敲） | **Secret** |

> `ADMIN_PASSWORD` 和 `SESSION_SECRET` 记得选 **Secret（加密）**类型，选了之后 Cloudflare 页面上也看不到明文。
>
> 三个变量都要加在 **Production（生产环境）** 下。

## 四、重新部署一次

变量改完后要重新部署才生效：

**Deployments（部署）** 标签 → 最新一条右侧 **⋯** → **Retry deployment（重试部署）**

---

## 检查是否配好

浏览器打开：

```
https://huibang-13v.pages.dev/api/health
```

- 看到 `{"ok":true,"missing":[]}` → 配置完成 ✅
- 看到 `missing` 里列着东西 → 按提示补上那几项

## 登录后台

```
https://huibang-13v.pages.dev/admin.html
```

用第三步设置的用户名密码登录。**登录后第一件事：进「修改密码」改成自己的密码**，之后 Cloudflare 里的 `ADMIN_PASSWORD` 就只是备用了。

---

## 后台能改什么

| 栏目 | 可修改内容 |
|---|---|
| 首页 | 首屏标题、简介、背景图、数据条、底部标语 |
| 企业介绍 | 段落标题与正文、配图、四张理念卡片 |
| 公司证件 | 两份证件清单（增删改、调顺序） |
| 产品目录 | 12 个分类、86 款产品：增删改、调顺序、逐个填详情 |
| 企业画册 | 上传/删除/排序画册页，可一次传多张 |
| 联系我们 | 三张卡片 |
| 公司信息 | 公司名、地址、**电话、邮箱**（页脚全站生效） |
| 修改密码 | 改自己的登录密码 |

点「保存并发布」后**立即生效**，刷新网站就能看到。

保存会自动留一份上一版，改坏了可以找我回滚（`/api/content/rollback`）。

---

## 注意事项

- 图片单张不超过 5MB；上传后存在 Cloudflare，不占 GitHub 仓库
- 登录状态保持 12 小时，之后需重新登录
- 后台地址不要公开，密码不要用弱密码
- 万一后台挂了，网站前台会自动回退到代码里的默认内容，**不会白屏**
