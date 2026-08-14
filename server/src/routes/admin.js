import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ code: 400, message: '账号密码必填' });
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) return res.status(401).json({ code: 401, message: '账号或密码错误' });
  if (!bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ code: 401, message: '账号或密码错误' });
  }
  const token = signToken(admin);
  res.json({
    code: 0,
    data: { token, admin: { id: admin.id, username: admin.username, role: admin.role } }
  });
});

// 当前账号信息
router.get('/me', requireAuth, (req, res) => {
  res.json({ code: 0, data: req.admin });
});

// 账号列表（仅管理员）
router.get('/list', requireAuth, requireRole('admin'), (req, res) => {
  const list = db.prepare('SELECT id, username, role, created_at FROM admins ORDER BY id').all();
  res.json({ code: 0, data: list });
});

export default router;
