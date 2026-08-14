import { Router } from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { deleteFile } from '../utils/fileDelete.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
const TEMPLATE_DIR = path.join(UPLOAD_ROOT, 'templates');
fs.mkdirSync(TEMPLATE_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_ROOT),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 模板文件专用存储（固定文件名，覆盖式更新）
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMPLATE_DIR),
  filename: (req, file, cb) => cb(null, 'pickup_template.xlsx')
});
const templateUpload = multer({
  storage: templateStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(xlsx|xls)$/i.test(file.originalname)) return cb(null, true);
    cb(new Error('仅支持 .xlsx / .xls 模板文件'));
  }
});

const router = Router();

// 通用设置：批量读取（前端启动时一次拿齐）
router.get('/', (req, res) => {
  const keys = Array.isArray(req.query?.keys) ? req.query.keys : String(req.query.keys || '').split(',').filter(Boolean);
  let rows;
  if (keys.length) {
    const q = keys.map(() => '?').join(',');
    rows = db.prepare(`SELECT key, value FROM settings WHERE key IN (${q})`).all(...keys);
  } else {
    rows = db.prepare('SELECT key, value FROM settings').all();
  }
  const data = {};
  for (const r of rows) data[r.key] = r.value;
  res.json({ code: 0, data });
});

// 通用设置：批量保存（key-value JSON）
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const body = req.body || {};
  const entries = Array.isArray(body) ? body.map(x => [x.key, x.value]) : Object.entries(body);
  const tx = db.transaction(() => {
    for (const [k, v] of entries) {
      if (typeof k !== 'string' || !k) continue;
      setSetting(k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''));
    }
  });
  tx();
  res.json({ code: 0 });
});

// 设置项读写辅助
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
}
function delSetting(key) {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}

// ===== 支付宝收款二维码 =====

// 公开：获取支付宝二维码（支付页要用）
router.get('/alipay-qrcode', (req, res) => {
  const url = getSetting('alipay_qrcode_url');
  res.json({ code: 0, data: { url: url || null } });
});

// 管理员：上传支付宝二维码
router.post('/alipay-qrcode', requireAuth, requireRole('admin'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到文件' });
  // 删除旧二维码文件
  const oldUrl = getSetting('alipay_qrcode_url');
  if (oldUrl) deleteFile(oldUrl);
  const url = `/uploads/${req.file.filename}`;
  setSetting('alipay_qrcode_url', url);
  res.json({ code: 0, data: { url } });
});

// 管理员：删除支付宝二维码
router.delete('/alipay-qrcode', requireAuth, requireRole('admin'), (req, res) => {
  const oldUrl = getSetting('alipay_qrcode_url');
  if (oldUrl) deleteFile(oldUrl);
  delSetting('alipay_qrcode_url');
  res.json({ code: 0 });
});

// ===== 自提码导出模板 =====

// 表头文字 → 数据字段 的自动识别规则
const FIELD_RULES = [
  { field: 'pickup_code', re: /自提码|提货码|取货码|自取码/ },
  { field: 'phone', re: /手机|电话|联系方式/ },
  { field: 'receiver_name', re: /姓名|收货人|联系人|收件人/ },
  { field: 'pickup_point_name', re: /自提点|提货点|取货点|站点/ },
  { field: 'pickup_point_address', re: /自提点地址|提货地址|站点地址/ },
  { field: 'items_text', re: /商品|货品|品名|明细/ },
  { field: 'total_amount', re: /金额|价|实付|总价/ },
  { field: 'status_text', re: /状态/ },
  { field: 'order_no', re: /订单号|单号|订单编号/ },
  { field: 'created_at', re: /下单时间|时间|日期/ },
  { field: 'paid_at', re: /支付时间/ },
  { field: 'completed_at', re: /核销时间|完成时间/ }
];

// 解析模板表头，建立 {field: 列号(1-based)} 映射
async function parseTemplate(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.getWorksheet(1) || wb.worksheets[0];
  if (!ws) throw new Error('模板中没有工作表');
  const headerRow = ws.getRow(1);
  const headers = [];
  const mapping = {};
  // 记录已被占用的字段，避免重复匹配
  const usedFields = new Set();
  for (let col = 1; col <= ws.columnCount; col++) {
    const cellVal = headerRow.getCell(col).value;
    const text = String(cellVal == null ? '' : cellVal).trim();
    headers.push(text);
    if (!text) continue;
    for (const rule of FIELD_RULES) {
      if (usedFields.has(rule.field)) continue;
      if (rule.re.test(text)) {
        mapping[rule.field] = col;
        usedFields.add(rule.field);
        break;
      }
    }
  }
  if (Object.keys(mapping).length === 0) {
    throw new Error('未能识别任何表头列，请确保模板第一行包含如「自提码/手机号/自提点」等列名');
  }
  return { headers, mapping };
}

// 管理员：上传自提码模板（自动识别表头）
router.post('/pickup-template', requireAuth, requireRole('admin'), templateUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到文件' });
  const filePath = req.file.path;
  try {
    const { headers, mapping } = await parseTemplate(filePath);
    const meta = {
      filename: req.file.originalname,
      headers,
      mapping,
      uploaded_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    setSetting('pickup_template_meta', JSON.stringify(meta));
    res.json({
      code: 0,
      data: {
        exists: true,
        ...meta,
        recognized_fields: Object.keys(mapping),
        message: `成功识别 ${Object.keys(mapping).length} 个列：${Object.keys(mapping).join('、')}`
      }
    });
  } catch (e) {
    // 解析失败删除已上传文件
    try { fs.unlinkSync(filePath); } catch (_) {}
    res.status(400).json({ code: 400, message: e.message });
  }
});

// 管理员：获取当前模板信息
router.get('/pickup-template', requireAuth, (req, res) => {
  const metaRaw = getSetting('pickup_template_meta');
  if (!metaRaw) return res.json({ code: 0, data: { exists: false } });
  try {
    const meta = JSON.parse(metaRaw);
    const filePath = path.join(TEMPLATE_DIR, 'pickup_template.xlsx');
    res.json({ code: 0, data: { exists: fs.existsSync(filePath), ...meta } });
  } catch (e) {
    res.json({ code: 0, data: { exists: false } });
  }
});

// 管理员：删除模板
router.delete('/pickup-template', requireAuth, requireRole('admin'), (req, res) => {
  const filePath = path.join(TEMPLATE_DIR, 'pickup_template.xlsx');
  try { fs.unlinkSync(filePath); } catch (_) {}
  delSetting('pickup_template_meta');
  res.json({ code: 0 });
});

export default router;
export { getSetting };
