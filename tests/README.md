# 测试

需要先装 jsdom（仅测试用，不影响网站）：

```bash
npm install
```

运行：

```bash
npm test              # 全部
node tests/api.test.mjs        # 后端 API（23 项，无需 jsdom）
node tests/admin-ui.test.js    # 后台增删改（34 项）
node tests/e2e.test.js         # 前后台打通 + 兜底 + XSS（16 项）
```

`admin-ui` 与 `e2e` 用 jsdom 加载真实页面、模拟真人点击，不需要启动服务器或联网。
