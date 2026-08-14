import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from './db.js';

import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import pickupRoutes from './routes/pickup.js';
import orderRoutes from './routes/orders.js';
import vipRoutes from './routes/vip.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/payment.js';
import exportRoutes from './routes/export.js';
import settingsRoutes from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态：上传的图片（物理删除目标）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pickup-points', pickupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查
app.get('/api/health', (req, res) => res.json({ code: 0, data: { ok: true, time: new Date().toISOString() } }));

// 前端静态资源（构建产物）
const mobileDist = path.join(__dirname, '../../mobile/dist');
const adminDist = path.join(__dirname, '../../admin/dist');

app.use('/m', express.static(mobileDist));
app.get('/m/*', (req, res, next) => {
  const p = path.join(mobileDist, 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  next();
});

app.use('/admin', express.static(adminDist));
app.get('/admin/*', (req, res, next) => {
  const p = path.join(adminDist, 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  next();
});

app.get('/', (req, res) => res.redirect('/m'));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 500, message: err.message || '服务器错误' });
});

// 定时关闭超时未支付订单（每分钟）
setInterval(() => {
  try {
    const rows = db.prepare(`SELECT id FROM orders WHERE status='pending_pay' AND created_at <= datetime('now','localtime','-15 minutes')`).all();
    if (rows.length) {
      const tx = db.transaction(() => {
        for (const o of rows) {
          const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
          for (const it of items) {
            if (it.sku_id) db.prepare('UPDATE product_skus SET stock = stock + ? WHERE id = ?').run(it.quantity, it.sku_id);
            if (it.product_id) db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(it.quantity, it.product_id);
          }
          db.prepare("UPDATE orders SET status='closed', closed_at=datetime('now','localtime') WHERE id=?").run(o.id);
        }
      });
      tx();
      console.log(`[auto-close] closed ${rows.length} expired orders`);
    }
  } catch (e) {
    console.error('auto-close error:', e.message);
  }
}, 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  好朋友市集团购商城后端已启动: http://localhost:${PORT}`);
  console.log(`  C端商城: http://localhost:${PORT}/m`);
  console.log(`  B端后台: http://localhost:${PORT}/admin`);
  console.log(`  管理员账号: admin / admin123`);
  console.log(`  核销员账号: verifier / verify123\n`);
});
