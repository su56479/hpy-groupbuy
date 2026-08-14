import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// B端：VIP列表
router.get('/', requireAuth, (req, res) => {
  const { phone } = req.query;
  let sql = 'SELECT * FROM vip_members';
  const params = [];
  if (phone) { sql += ' WHERE phone LIKE ?'; params.push(`%${phone}%`); }
  sql += ' ORDER BY id DESC';
  const list = db.prepare(sql).all(...params);
  res.json({ code: 0, data: list });
});

// B端：发放VIP（单个/批量手机号）
router.post('/grant', requireAuth, requireRole('admin'), (req, res) => {
  const { phones, valid_days = 365 } = req.body || {};
  if (!phones) return res.status(400).json({ code: 400, message: '手机号必填' });
  const arr = String(phones).split(/[\s,，;；\n]+/).map((s) => s.trim()).filter(Boolean);
  if (arr.length === 0) return res.status(400).json({ code: 400, message: '手机号必填' });
  const d = new Date();
  d.setDate(d.getDate() + Number(valid_days) || 365);
  const validUntil = d.toISOString().slice(0, 19).replace('T', ' ');
  const granted = [];
  const tx = db.transaction(() => {
    for (const phone of arr) {
      if (!/^1\d{10}$/.test(phone)) continue;
      // 撤销旧的，新增新的
      db.prepare('UPDATE vip_members SET revoked = 1 WHERE phone = ? AND revoked = 0').run(phone);
      const info = db.prepare('INSERT INTO vip_members (phone, valid_until, granted_by) VALUES (?,?,?)')
        .run(phone, validUntil, req.admin.username);
      granted.push({ id: info.lastInsertRowid, phone, valid_until: validUntil });
    }
  });
  tx();
  res.json({ code: 0, data: { count: granted.length, list: granted } });
});

// B端：撤销VIP
router.post('/revoke/:id', requireAuth, requireRole('admin'), (req, res) => {
  db.prepare('UPDATE vip_members SET revoked = 1 WHERE id = ?').run(req.params.id);
  res.json({ code: 0 });
});

// C端：查询手机号是否VIP
router.get('/check', (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ code: 0, data: { is_vip: false } });
  const row = db.prepare(`SELECT * FROM vip_members WHERE phone = ? AND revoked = 0 AND valid_until >= datetime('now','localtime') ORDER BY id DESC LIMIT 1`).get(phone);
  res.json({ code: 0, data: { is_vip: !!row, valid_until: row?.valid_until } });
});

export default router;
