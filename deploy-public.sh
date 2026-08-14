#!/usr/bin/env bash
# ============================================================
# 好朋友集市 · 一键公网部署 + 二维码生成脚本
# 适用环境：任何带公网 IP / 或能连外网的 Linux / macOS 电脑
# 用法：bash deploy-public.sh
# 输出：H5 + 后台 公网 URL + 二维码 PNG + 终端二维码
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

export PORT="${PORT:-3000}"
ROOT_DIR="$(pwd)"

# 1. 安装依赖（已安装则跳过）
[ ! -d server/node_modules ]  && (cd server && npm install --omit=dev --no-audit || npm install --no-audit)
[ ! -f mobile/dist/index.html ]  && (cd mobile && npm install --no-audit && npm run build)
[ ! -f admin/dist/index.html ]   && (cd admin  && npm install --no-audit && npm run build)

# 2. 后台启动服务（如已启动先停掉）
pkill -f "node src/index.js" 2>/dev/null || true
sleep 1
(cd server && nohup node src/index.js > server.log 2>&1 &)
sleep 3

# 3. 起公网隧道（优先 Cloudflare Quick Tunnel，其次 localtunnel）
PUBLIC_URL=""
echo "[1/3] 启动免费公网隧道..."
if command -v cloudflared >/dev/null 2>&1; then
  (cloudflared tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate > cf.log 2>&1 &)
  for i in $(seq 1 30); do
    URL=$(grep -oE "https://[a-zA-Z0-9-]+\.trycloudflare\.com" cf.log | head -1 || true)
    [ -n "$URL" ] && { PUBLIC_URL="$URL"; break; }
    sleep 2
  done
fi

if [ -z "$PUBLIC_URL" ] && command -v npx >/dev/null 2>&1; then
  cat > /tmp/hpy-lt.mjs <<'LT'
import localtunnel from 'localtunnel';
(async () => {
  const t = await localtunnel({ port: Number(process.env.PORT||'3000') });
  console.log('PUBLIC_URL=' + t.url);
  setInterval(() => {}, 2**31-1);
})();
LT
  (cd server && [ ! -d node_modules/localtunnel ] && npm install localtunnel --no-audit >/dev/null 2>&1 || true)
  (PORT=$PORT node /tmp/hpy-lt.mjs > lt.log 2>&1 &)
  for i in $(seq 1 40); do
    URL=$(grep -oE "https://[a-zA-Z0-9-]+\.loca\.lt"  lt.log | head -1 || true)
    [ -z "$URL" ] && URL=$(grep -oE "https://[a-zA-Z0-9.-]+" lt.log | grep -i tunnel | head -1 || true)
    [ -n "$URL" ] && { PUBLIC_URL="$URL"; break; }
    sleep 2
  done
fi

if [ -z "$PUBLIC_URL" ]; then
  # fallback：直接用本机 IP
  MY_IP=$(curl -sS --max-time 5 ifconfig.me || hostname -I | awk '{print $1}')
  PUBLIC_URL="http://${MY_IP}:${PORT}"
fi

# 4. 生成二维码（标准 qrcode 库）
echo "[2/3] 生成二维码：$PUBLIC_URL"
(cd server && [ ! -d node_modules/qrcode ] && npm install qrcode --no-audit >/dev/null 2>&1 || true)
cat > /tmp/hpy-qr.mjs <<'QR'
import QRCode from 'qrcode';
const u = process.env.PUBLIC_URL;
const H  = u + '/m';
const A  = u + '/admin';
const D  = u + '/m/#/hero-demo';
const opts = { errorCorrectionLevel: 'H', width: 520, margin: 2, color: { dark: '#1677FF', light: '#FFFFFF' }};
await QRCode.toFile(process.env.QR_M,  H, opts);
await QRCode.toFile(process.env.QR_A,  A, opts);
await QRCode.toFile(process.env.QR_D,  D, opts);
async function print(label, url) {
  console.log('\n================================');
  console.log(label + '：' + url);
  console.log(await QRCode.toString(url, { type: 'terminal', small: true }));
}
await print('✅ C 端 H5 商城',       H);
await print('✅ B 端团长管理后台',   A);
await print('✅ HERO 方案对比 demo', D);
console.log('\n二维码 PNG 文件：');
console.log('  - ' + process.env.QR_M);
console.log('  - ' + process.env.QR_A);
console.log('  - ' + process.env.QR_D);
QR
PUBLIC_URL="$PUBLIC_URL" \
QR_M="$ROOT_DIR/qr-mobile-h5-public.png" \
QR_A="$ROOT_DIR/qr-admin-public.png" \
QR_D="$ROOT_DIR/qr-hero-demo-public.png" \
node /tmp/hpy-qr.mjs

echo "[3/3] 完成 ✅ 后台已就绪，日志：tail -f $ROOT_DIR/server/server.log"
