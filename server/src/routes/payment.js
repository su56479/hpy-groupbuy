import { Router } from 'express';
import db from '../db.js';

const router = Router();

// 模拟支付宝扫码支付页面（真实环境对接支付宝SDK）
// 提交订单后前端跳转到 /api/payment/pay?order_no=xxx
router.get('/pay', (req, res) => {
  const orderNo = req.query.order_no;
  if (!orderNo) return res.status(400).send('缺少订单号');
  const order = db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo);
  if (!order) return res.status(404).send('订单不存在');
  if (order.status === 'closed') return res.send('订单已关闭');

  // 读取后台上传的支付宝收款二维码（若无则用占位图）
  const qrRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('alipay_qrcode_url');
  const qrcodeUrl = qrRow ? qrRow.value : '';
  const qrHtml = qrcodeUrl
    ? `<img src="${qrcodeUrl}" alt="支付宝收款码" style="width:200px;height:200px;object-fit:contain;"/>`
    : `<div style="color:#bbb;font-size:13px;line-height:1.6;">管理员尚未上传<br/>支付宝收款二维码</div>`;

  res.type('html').send(`
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>支付宝扫码支付</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:-apple-system,"PingFang SC",sans-serif; background:#f5f5f5; color:#333; min-height:100vh; display:flex; justify-content:center; align-items:center; }
      .pay-box { background:#fff; border-radius:16px; padding:32px 24px; width:90%; max-width:360px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,.06); }
      .brand { color:#1677ff; font-size:20px; font-weight:bold; margin-bottom:8px; }
      .amount { font-size:36px; font-weight:bold; color:#ff4d4f; margin:16px 0; }
      .amount small { font-size:16px; }
      .qr { width:200px; height:200px; margin:16px auto; background:#fff; border:1px solid #eee; display:flex; align-items:center; justify-content:center; }
      .tip { color:#999; font-size:13px; margin-top:12px; }
      .btn { display:block; width:100%; height:46px; border:none; border-radius:23px; background:#1677ff; color:#fff; font-size:16px; margin-top:20px; cursor:pointer; }
      .btn:active { opacity:.85; }
      .order-no { color:#999; font-size:12px; margin-top:8px; word-break:break-all; }
    </style>
  </head>
  <body>
    <div class="pay-box">
      <div class="brand">支付宝</div>
      <div style="color:#999;font-size:13px;">好朋友市集团购商城</div>
      <div class="amount"><small>￥</small>${order.total_amount.toFixed(2)}</div>
      <div class="qr">
        ${qrHtml}
      </div>
      <div class="tip">请使用支付宝扫码支付</div>
      <div class="order-no">订单号：${order.order_no}</div>
      <button class="btn" id="payBtn">模拟支付成功</button>
    </div>
    <script>
      const orderNo = ${JSON.stringify(orderNo)};
      document.getElementById('payBtn').addEventListener('click', async () => {
        const btn = document.getElementById('payBtn');
        btn.textContent = '处理中...'; btn.disabled = true;
        const r = await fetch('/api/payment/callback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order_no: orderNo }) });
        const j = await r.json();
        if (j.code === 0) {
          location.href = '/m/payment-result?order_no=' + orderNo + '&status=success';
        } else {
          alert(j.message || '支付失败'); btn.textContent='模拟支付成功'; btn.disabled=false;
        }
      });
    </script>
  </body>
  </html>
  `);
});

// 支付回调（模拟异步通知，更新订单状态）
router.post('/callback', (req, res) => {
  const { order_no } = req.body || {};
  const order = db.prepare('SELECT * FROM orders WHERE order_no = ?').get(order_no);
  if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
  if (order.status === 'completed' || order.status === 'pending_pickup') {
    return res.json({ code: 0, data: { status: order.status } });
  }
  if (order.status === 'closed') return res.status(400).json({ code: 400, message: '订单已关闭' });
  db.prepare("UPDATE orders SET status='pending_pickup', paid_at=datetime('now','localtime') WHERE id=?").run(order.id);
  res.json({ code: 0, data: { status: 'pending_pickup' } });
});

export default router;
