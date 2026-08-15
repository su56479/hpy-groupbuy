#!/bin/bash
set -e

echo "=========================================="
echo "  好朋友集市 - 一键构建脚本"
echo "=========================================="

# ---- 1. 安装后端依赖 ----
echo ""
echo "📦 [1/5] 安装后端依赖..."
cd /app/server
npm install --no-audit --no-fund --production=false

# ---- 2. 构建 Mobile H5 前端 ----
echo ""
echo "🎨 [2/5] 构建 H5 商城前端..."
cd /app/mobile
if [ ! -d "node_modules" ]; then
  npm install --no-audit --no-fund --production=false
fi
# 设置 API 基础地址（相对路径，同域部署）
export VITE_API_BASE=""
npm run build

# ---- 3. 构建 Admin 后台前端 ----
echo ""
echo "🛠️  [3/5] 构建后台管理前端..."
cd /app/admin
if [ ! -d "node_modules" ]; then
  npm install --no-audit --no-fund --production=false
fi
# 设置 API 基础地址（相对路径，同域部署）
export VITE_API_BASE=""
npm run build

# ---- 4. 复制构建产物到后端 public 目录 ----
echo ""
echo "📤 [4/5] 复制构建产物到后端..."
cd /app
rm -rf server/public/m server/public/admin
mkdir -p server/public
cp -r mobile/dist server/public/m
cp -r admin/dist server/public/admin

# ---- 5. 清理数据库上传目录（首次部署不复制）----
echo ""
echo "🧹 [5/5] 准备运行目录..."
mkdir -p server/data server/uploads

echo ""
echo "✅ 构建完成！"
echo "  H5 商城:  server/public/m/"
echo "  后台管理:  server/public/admin/"
echo "  启动命令: cd server && node src/index.js"
echo "=========================================="
