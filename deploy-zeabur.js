#!/usr/bin/env zx

// Zeabur 部署配置说明
// 您可以用手机浏览器打开 https://zeabur.com
// 用 GitHub 账号登录后，选择 Import from GitHub，选择 su56479/hpy-groupbuy 仓库
// Zeabur 会自动识别 Dockerfile 并部署

const fs = require('fs');

console.log(`
==========================================
  好朋友集市 - Zeabur 部署指南
==========================================

📱 手机上按以下步骤操作：

第一步：打开 Zeabur
👉 浏览器输入：https://zeabur.com
👉 右上角点「登录」→ 选择「GitHub 登录」
   （用您的 su56479 账号授权登录）

第二步：导入项目
👉 点右上角「创建项目」
👉 选择「导入 Git 仓库」
👉 找到并选择：su56479/hpy-groupbuy
👉 点击「Import」

第三步：等待部署
👉 Zeabur 会自动识别 Dockerfile 并开始构建
👉 构建时间约 5-8 分钟（构建前端需要时间）
👉 看到状态变成「Running」（绿色）就成功了

第四步：获取公网地址
👉 进入项目 → 点「网络」标签
👉 找到「Public Network」区域
👉 点「生成域名」，复制给您的公网地址

部署完成后访问：
🛒 H5 商城：https://<您的域名>/m/
🛠️ 后台管理：https://<您的域名>/admin/
后台账号：admin / admin123
        或  verifier / verify123

==========================================
`);
