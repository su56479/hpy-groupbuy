import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { deleteImageSet } from '../utils/fileDelete.js';

const router = Router();

// C端：在售商品列表
router.get('/', (req, res) => {
  const onlyOnShelf = req.query.all !== '1';
  const rows = db.prepare(
    onlyOnShelf
      ? 'SELECT * FROM products WHERE status = ? ORDER BY id DESC'
      : 'SELECT * FROM products ORDER BY id DESC'
  ).all(onlyOnShelf ? 'on_shelf' : undefined);
  const list = rows.map(parseProduct);
  res.json({ code: 0, data: list });
});

// C端/B端：商品详情
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ code: 404, message: '商品不存在' });
  const skus = db.prepare('SELECT * FROM product_skus WHERE product_id = ?').all(p.id);
  res.json({ code: 0, data: { ...parseProduct(p), skus } });
});

// B端：新建商品
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, price, sku_code, stock, main_image, detail_images, skus = [] } = req.body || {};
  if (!name || !sku_code) return res.status(400).json({ code: 400, message: '名称与SKU编号必填' });
  const exist = db.prepare('SELECT id FROM products WHERE sku_code = ?').get(sku_code);
  if (exist) return res.status(400).json({ code: 400, message: 'SKU编号已存在' });
  const info = db.prepare(`INSERT INTO products (name, price, sku_code, stock, status, main_image, detail_images)
    VALUES (?,?,?,?,?,?,?)`).run(
    name, price ?? 0, sku_code, stock ?? 0, 'on_shelf',
    main_image || null, JSON.stringify(detail_images || [])
  );
  const pid = info.lastInsertRowid;
  for (const s of skus) {
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid, s.spec, s.price, s.stock, s.sku_code || `${sku_code}-${s.spec}`);
  }
  res.json({ code: 0, data: { id: pid } });
});

// B端：编辑商品
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ code: 404, message: '商品不存在' });
  const { name, price, sku_code, stock, main_image, detail_images, skus } = req.body || {};
  const newMain = main_image !== undefined ? main_image : p.main_image;
  const newDetails = detail_images !== undefined ? JSON.stringify(detail_images || []) : p.detail_images;

  // 处理图片替换删除：若主图被替换，删旧主图
  if (main_image !== undefined && p.main_image && p.main_image !== main_image) {
    deleteImageSet(p.main_image, []);
  }
  if (detail_images !== undefined) {
    const oldDetails = JSON.parse(p.detail_images || '[]');
    const newSet = new Set(detail_images || []);
    const removed = oldDetails.filter((x) => !newSet.has(x));
    if (removed.length) deleteImageSet(null, removed);
  }

  db.prepare(`UPDATE products SET name=?, price=?, sku_code=?, stock=?, main_image=?, detail_images=?, updated_at=datetime('now','localtime') WHERE id=?`)
    .run(
      name ?? p.name, price ?? p.price, sku_code ?? p.sku_code, stock ?? p.stock,
      newMain, newDetails, p.id
    );

  if (Array.isArray(skus)) {
    db.prepare('DELETE FROM product_skus WHERE product_id = ?').run(p.id);
    for (const s of skus) {
      db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
        .run(p.id, s.spec, s.price, s.stock, s.sku_code || `${sku_code || p.sku_code}-${s.spec}`);
    }
  }
  res.json({ code: 0 });
});

// B端：上架/下架
router.patch('/:id/status', requireAuth, requireRole('admin'), (req, res) => {
  const { status } = req.body || {};
  if (!['on_shelf', 'off_shelf'].includes(status)) return res.status(400).json({ code: 400, message: '状态非法' });
  db.prepare("UPDATE products SET status=?, updated_at=datetime('now','localtime') WHERE id=?").run(status, req.params.id);
  res.json({ code: 0 });
});

// B端：删除商品（数据库 + 存储图片双物理删除，不可恢复）
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ code: 404, message: '商品不存在' });
  const details = JSON.parse(p.detail_images || '[]');
  const deletedImgs = deleteImageSet(p.main_image, details);
  db.prepare('DELETE FROM product_skus WHERE product_id = ?').run(p.id);
  db.prepare('DELETE FROM products WHERE id = ?').run(p.id); // 物理删除
  res.json({ code: 0, data: { deleted_images: deletedImgs } });
});

function parseProduct(p) {
  return {
    ...p,
    detail_images: JSON.parse(p.detail_images || '[]')
  };
}

export default router;
