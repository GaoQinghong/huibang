# 慧邦生物 · 企业官网

巨野县韦恩生物科技有限公司 / 山东慧邦生物科技有限公司 的静态展示网站，托管于 GitHub Pages。

## 页面

| 页面 | 文件 | 说明 |
|---|---|---|
| 首页 | `index.html` | 企业介绍 + 公司证件（画册第 1、2 页内容） |
| 产品目录 | `catalog.html` | 画册目录（第 3 页），支持搜索与分类筛选，每条可点击 |
| 产品详情 | `product.html?id=xxx` | 由目录跳转，展示单个产品 |
| 企业画册 | `brochure.html` | 画册原页浏览 |
| 联系我们 | `contact.html` | 联系方式 |

## 如何维护内容

全部产品数据集中在 **`assets/js/data.js`**，改这一个文件即可，页面会自动更新：

- `COMPANY` — 公司名称、地址、**电话、邮箱**（目前为空，请填写）
- `CERTS` — 公司证件 / 新登记证件清单
- `CATALOG` — 12 个产品分类及其产品

### 新增一个产品

在对应分类的 `items` 数组里加一行：

```js
{ name: '产品名', spec: '25%某某悬浮剂', page: '30' }
```

### 给产品补充详情

在该产品对象里加上这些字段（可选）：

```js
{
  name: '到喜', spec: '8%甲维盐可溶液剂', page: '04',
  image: 'assets/img/p-xxx.webp',   // 产品图
  tagline: '一句话卖点',
  features: ['特点一', '特点二'],
  usage: '使用方法 / 注药适期',
  packing: '20毫升*150瓶'
}
```

产品 id 由脚本按 `分类id-序号` 自动生成，目录链接与详情页会自动对应，无需手写。

## 本地预览

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署

推送到 `main` 分支后，GitHub Pages 自动发布（Settings → Pages → Branch: main / root）。
`.nojekyll` 用于跳过 Jekyll 处理。

## 待补充

- 公司联系电话、邮箱（`data.js` 中的 `COMPANY`）
- 画册第 7 页之后的产品详情内容
- 目录中的产品名称由画册图片识别录入，建议按原稿核对一遍
