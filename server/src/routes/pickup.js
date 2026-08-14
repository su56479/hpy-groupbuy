import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// C端：自提点列表
router.get('/', (req, res) => {
  const list = db.prepare('SELECT * FROM pickup_points ORDER BY id').all();
  res.json({ code: 0, data: list });
});

// B端：新增
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, address, contact_phone } = req.body || {};
  if (!name || !address) return res.status(400).json({ code: 400, message: '名称与地址必填' });
  const info = db.prepare('INSERT INTO pickup_points (name, address, contact_phone) VALUES (?,?,?)')
    .run(name, address, contact_phone || null);
  res.json({ code: 0, data: { id: info.lastInsertRowid } });
});

// B端：编辑
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const exist = db.prepare('SELECT id FROM pickup_points WHERE id = ?').get(req.params.id);
  if (!exist) return res.status(404).json({ code: 404, message: '自提点不存在' });
  const { name, address, contact_phone } = req.body || {};
  db.prepare('UPDATE pickup_points SET name=?, address=?, contact_phone=? WHERE id=?')
    .run(name, address, contact_phone, req.params.id);
  res.json({ code: 0 });
});

// B端：删除
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM pickup_points WHERE id = ?').run(req.params.id);
  res.json({ code: 0 });
});

export default router;
