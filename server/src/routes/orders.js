import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// 生成订单号 + 自提码
function genOrderNo() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HPY${ts}${rand}`;
}

function pickupCode(phone) {
  const last4 = String(phone).replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `HPY${last4}`;
}

// C端：创建订单
router.post('/', (req, res) => {
  const { phone, receiver_name, receiver_address, pickup_point_id, items = [] } = req.body || {};
  if (!phone || !/^1\d{10}$/.test(phone)) return res.status(400).json({ code: 400, message: '手机号格式不正确' });
  if (!pickup_point_id) return res.status(400).json({ code: 400, message: '请选择自提点' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ code: 400, message: '请选择商品' });

  const point = db.prepare('SELECT * FROM pickup_points WHERE id = ?').get(pickup_point_id);
  if (!point) return res.status(400).json({ code: 400, message: '自提点不存在' });

  // 校验商品与库存（事务）
  let total = 0;
  const orderItems = [];
  const tx = db.transaction(() => {
    for (const it of items) {
      const p = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(it.product_id, 'on_shelf');
      if (!p) throw new Error(`商品 ${it.product_id} 已下架或不存在`);
      let unitPrice = p.price;
      let skuId = null;
      let skuSpec = null;
      let stockOwner = p;
      if (it.sku_id) {
        const sku = db.prepare('SELECT * FROM product_skus WHERE id = ? AND product_id = ?').get(it.sku_id, p.id);
        if (!sku) throw new Error('SKU规格不存在');
        unitPrice = sku.price;
        skuId = sku.id;
        skuSpec = sku.spec;
        stockOwner = sku;
      }
      const qty = Number(it.quantity) || 0;
      if (qty <= 0) throw new Error('购买数量必须大于0');
      if (stockOwner.stock < qty) throw new Error(`商品 ${p.name} 库存不足`);
      // 扣减库存（skuId 在上方 SKU 分支已赋值，等于 sku.id，避免引用已离开作用域的 sku）
      if (it.sku_id) {
        db.prepare('UPDATE product_skus SET stock = stock - ? WHERE id = ?').run(qty, skuId);
      }
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, p.id);
      total += unitPrice * qty;
      orderItems.push({ product_id: p.id, product_name: p.name, sku_id: skuId, sku_spec: skuSpec, price: unitPrice, quantity: qty });
    }

    // 用户记录（首次自动创建）
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      const u = db.prepare('INSERT INTO users (phone, name, address, pickup_point_id) VALUES (?,?,?,?)')
        .run(phone, receiver_name || null, receiver_address || null, pickup_point_id);
      user = { id: u.lastInsertRowid };
    } else {
      db.prepare('UPDATE users SET name=COALESCE(?,name), address=COALESCE(?,address), pickup_point_id=? WHERE id=?')
        .run(receiver_name || null, receiver_address || null, pickup_point_id, user.id);
    }

    const orderNo = genOrderNo();
    const code = pickupCode(phone);
    const o = db.prepare(`INSERT INTO orders
      (order_no, user_id, phone, receiver_name, receiver_address, pickup_point_id, pickup_point_name, pickup_point_address, total_amount, status, pickup_code)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      orderNo, user.id, phone, receiver_name || null, receiver_address || null,
      point.id, point.name, point.address, Number(total.toFixed(2)), 'pending_pay', code
    );
    const orderId = o.lastInsertRowid;
    for (const oi of orderItems) {
      db.prepare('INSERT INTO order_items (order_id, product_id, product_name, sku_id, sku_spec, price, quantity) VALUES (?,?,?,?,?,?,?)')
        .run(orderId, oi.product_id, oi.product_name, oi.sku_id, oi.sku_spec, oi.price, oi.quantity);
    }
    return { orderNo, orderId, code };
  });

  try {
    const result = tx();
    res.json({ code: 0, data: { order_no: result.orderNo, order_id: result.orderId, pickup_code: result.code, total_amount: Number(total.toFixed(2)) } });
  } catch (e) {
    res.status(400).json({ code: 400, message: e.message });
  }
});

// C端：按手机号查订单（实时拉取，不持久化本地）
router.get('/by-phone', (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ code: 400, message: '手机号必填' });
  const orders = db.prepare('SELECT * FROM orders WHERE phone = ? ORDER BY id DESC').all(phone);
  const data = orders.map(attachItems);
  res.json({ code: 0, data });
});

// C端：订单详情
router.get('/:id', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ? OR order_no = ?').get(req.params.id, req.params.id);
  if (!o) return res.status(404).json({ code: 404, message: '订单不存在' });
  res.json({ code: 0, data: attachItems(o) });
});

// B端：订单列表（筛选/搜索）
router.get('/', requireAuth, (req, res) => {
  const { status, phone, pickup_point_id, start, end, keyword } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (phone) { sql += ' AND phone LIKE ?'; params.push(`%${phone}%`); }
  if (pickup_point_id) { sql += ' AND pickup_point_id = ?'; params.push(pickup_point_id); }
  if (start) { sql += " AND created_at >= ?"; params.push(start); }
  if (end) { sql += " AND created_at <= ?"; params.push(end); }
  if (keyword) {
    sql += ' AND (order_no LIKE ? OR pickup_code LIKE ? OR phone LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  sql += ' ORDER BY id DESC LIMIT 1000';
  const orders = db.prepare(sql).all(...params);
  const data = orders.map(attachItems);
  res.json({ code: 0, data, total: data.length });
});

// B端：核销（输入自提码/手机号/订单号，标记已完成自提）
router.post('/verify', requireAuth, (req, res) => {
  const body = req.body || {};
  const keyword = (body.keyword || body.pickup_code || body.phone || body.order_no || '').toString().trim();
  if (!keyword) return res.status(400).json({ code: 400, message: '请输入自提码/手机号/订单号' });
  const orders = db.prepare(`SELECT * FROM orders WHERE pickup_code = ? OR phone = ? OR order_no = ?`)
    .all(keyword, keyword, keyword);
  const pending = orders.filter((o) => o.status === 'pending_pickup');
  if (pending.length === 0) {
    return res.status(400).json({ code: 400, message: '未找到待自提订单，请核对信息' });
  }
  const tx = db.transaction(() => {
    for (const o of pending) {
      db.prepare("UPDATE orders SET status='completed', completed_at=datetime('now','localtime') WHERE id=?").run(o.id);
    }
  });
  tx();
  res.json({ code: 0, data: { verified: pending.length, orders: pending.map(attachItems) } });
});

// B端：搜索订单（by keyword，用于自提码/手机号/订单号通用查询）
router.post('/search', (req, res) => {
  const keyword = ((req.body || {}).keyword || '').toString().trim();
  if (!keyword) return res.json({ code: 0, data: [] });
  let sql = 'SELECT * FROM orders WHERE pickup_code = ? OR phone = ? OR order_no = ? ORDER BY id DESC LIMIT 100';
  const orders = db.prepare(sql).all(keyword, keyword, keyword);
  res.json({ code: 0, data: orders.map(attachItems) });
});

// B端：删除订单（物理删除，同时删除订单项；若待支付/待自提则先回库存）
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = req.params.id;
  const o = db.prepare('SELECT * FROM orders WHERE id = ? OR order_no = ?').get(id, id);
  if (!o) return res.status(404).json({ code: 404, message: '订单不存在' });
  const tx = db.transaction(() => {
    // 如果是待支付或待自提，归还库存
    if (o.status === 'pending_pay' || o.status === 'pending_pickup') {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      for (const it of items) {
        if (it.sku_id) db.prepare('UPDATE product_skus SET stock = stock + ? WHERE id = ?').run(it.quantity, it.sku_id);
        db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(it.quantity, it.product_id);
      }
    }
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(o.id);
    db.prepare('DELETE FROM orders WHERE id = ?').run(o.id);
  });
  tx();
  res.json({ code: 0, data: { deleted: o.id } });
});

// 关闭超时未支付订单（定时调用，释放库存）
router.post('/auto-close', (req, res) => {
  const rows = db.prepare(`SELECT * FROM orders WHERE status='pending_pay' AND created_at <= datetime('now','localtime','-15 minutes')`).all();
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
  res.json({ code: 0, data: { closed: rows.length } });
});

function attachItems(o) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
  return { ...o, items };
}

export default router;
