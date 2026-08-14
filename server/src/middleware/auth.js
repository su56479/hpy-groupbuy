import jwt from 'jsonwebtoken';
import db from '../db.js';

const SECRET = 'hpy-groupbuy-secret-2026';

export function signToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, SECRET, { expiresIn: '7d' });
}

// 解析 token（可选，不强制）
export function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.admin = jwt.verify(token, SECRET);
    } catch (e) {
      req.admin = null;
    }
  }
  next();
}

// 强制登录
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ code: 401, message: '未登录' });
  try {
    const payload = jwt.verify(token, SECRET);
    const admin = db.prepare('SELECT id, username, role FROM admins WHERE id = ?').get(payload.id);
    if (!admin) return res.status(401).json({ code: 401, message: '账号不存在' });
    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: '登录已过期' });
  }
}

// 角色校验
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ code: 401, message: '未登录' });
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ code: 403, message: '无权限' });
    }
    next();
  };
}

export { SECRET };
