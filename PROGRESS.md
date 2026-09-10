# 项目进展

> 最后更新：2026-09-10

## 一句话

慧邦生物（农药公司）企业官网，已上线，带管理后台，管理员可自己改所有内容。

## 线上地址

| 用途 | 地址 | 状态 |
|---|---|---|
| **正式网站** | https://huibang-13v.pages.dev/ | ✅ 使用中（Cloudflare Pages） |
| **管理后台** | https://huibang-13v.pages.dev/admin.html | ✅ 已配置可登录 |
| 配置自检 | https://huibang-13v.pages.dev/api/health | 应返回 `{"ok":true,"missing":[]}` |
| 备用地址 | https://gaoqinghong.github.io/huibang/ | 仍可访问，但无后台（静态回退） |
| 代码仓库 | git@github.com:GaoQinghong/huibang.git | — |

推送到 `main` 后 Cloudflare 自动部署，约 1 分钟生效。

## 已完成

- **5 个前台页面**：首页（企业介绍 + 公司证件）、产品目录、产品详情、企业画册、联系我们
- **产品目录**：12 分类 / 86 款产品，支持搜索与分类筛选，**每条可点击进详情页**
- **管理后台**：账号密码登录，8 个栏目可视化增删改，图片上传，改密码，内容回滚
- **前台从后台读内容**，后台或存储不可用时自动回退到 `assets/js/data.js` 的默认内容，不会白屏
- **73 项自动化测试**全部通过（`npm test`）

## 待办

1. **联系电话和邮箱还是空的** —— 画册里没有这些信息。管理员可在后台「公司信息」里填，填完页脚和联系页全站生效。
2. **产品名需要按原稿核对** —— 86 条目录是从画册图片识别录入的，以下几个字不确定：
   `恶阔星`、`噬虫嗪`、`草净挫`、`根覆`、`潜丝清`、`戏菌`、`正726`
3. **新闻中心 / 自定义页面** —— 已向用户提议，尚未决定要不要做。
4. **自有域名** —— 现在是 `huibang-13v.pages.dev`（`huibang` 被占用）。买域名后可在 Cloudflare 绑定，约 60–90 元/年。

## 用户的选择与理由

- 从 GitHub Pages 迁到 Cloudflare Pages，主因是**国内访问速度**（客户是国内经销商和农户），顺带获得真正的账号密码后台。
- 后台要求：管理员能自己改**首页、企业介绍、公司证件、产品目录、企业画册、联系我们**这 6 块。
- 不希望网址里出现自己的名字，所以没用 `用户名.github.io` 这种地址。

## 目录结构

```
index.html / catalog.html / product.html / brochure.html / contact.html   前台
admin.html                          后台
functions/api/[[route]].js          后端 API（Cloudflare Pages Functions）
assets/js/data.js                   全站默认内容（DEFAULT_SITE）
assets/js/main.js                   前台：拉后台内容、渲染导航页脚、锚点跳转
assets/js/admin.js                  后台逻辑
assets/img/*.webp                   画册原图（8 张）
tests/                              73 项测试
DEPLOY.md                           Cloudflare 配置步骤
```

## 内容怎么存的

- 后台保存 → 写入 Cloudflare KV（绑定名 `HUIBANG`），键 `site:content`
- 上传的图片 → 也存 KV，键 `img:<hash>`，通过 `/api/image/<id>` 读取
- 保存时自动留一份上一版（`site:content:prev`），可用 `POST /api/content/rollback` 回滚
- `assets/js/data.js` 是出厂默认内容，只在 KV 读不到时使用；日常改内容用后台，不必改这个文件

## Cloudflare 需要的配置（已配好，重建项目时才需要重做）

| 类型 | 名称 | 说明 |
|---|---|---|
| KV 绑定 | `HUIBANG` | 变量名必须一字不差 |
| 环境变量 | `ADMIN_USER` | 管理员用户名 |
| 环境变量（Secret） | `ADMIN_PASSWORD` | 初始密码；后台改过密码后以 KV 中的为准 |
| 环境变量（Secret） | `SESSION_SECRET` | 登录票据签名用的随机串 |

改这些变量后要在 Deployments 里 Retry 一次才生效。

## 推送代码需要的本机配置

这个仓库用**专用部署密钥**，不是默认的 `id_ed25519`（那把是别的仓库的 deploy key，对本仓库只读）：

- 私钥：`~/.ssh/huibang_deploy`
- `~/.ssh/config` 中的别名：`github-huibang`
- remote 地址：`git@github-huibang:GaoQinghong/huibang.git`

换机器时需要重新生成密钥并添加到仓库的 Deploy keys（勾选 Allow write access）。

## 素材来源

原始画册图片在 `/Users/bytedance/Desktop/测试/`（`封面.webp`、`1.webp` ~ `7.webp`），已复制进 `assets/img/`。
网站文字内容全部由这 8 张图识别整理而来。

## 修过的坑

- **锚点点击没反应**：内容改成 JS 异步渲染后，浏览器原生锚点跳转在元素生成前就执行了。已在渲染完成后主动处理 `location.hash`，同页锚点改为拦截 + 平滑滚动。
- **产品详情编辑被弹回列表**：列表编辑器改动后调用 `render()` 重绘整个面板，丢失了"当前在详情页"的状态。已加 `detailItem` 状态。
