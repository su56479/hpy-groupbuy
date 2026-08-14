import { Router } from 'express';
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getSetting } from './settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '../../uploads/templates');

const router = Router();

// 全量订单导出
router.get('/orders', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, phone, pickup_point_id, start, end } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (phone) { sql += ' AND phone LIKE ?'; params.push(`%${phone}%`); }
  if (pickup_point_id) { sql += ' AND pickup_point_id = ?'; params.push(pickup_point_id); }
  if (start) { sql += ' AND created_at >= ?'; params.push(start); }
  if (end) { sql += ' AND created_at <= ?'; params.push(end); }
  sql += ' ORDER BY id DESC';
  const orders = db.prepare(sql).all(...params);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('订单清单');
  ws.columns = [
    { header: '订单号', key: 'order_no', width: 26 },
    { header: '下单时间', key: 'created_at', width: 20 },
    { header: '手机号', key: 'phone', width: 14 },
    { header: '收货人', key: 'receiver_name', width: 12 },
    { header: '收货地址', key: 'receiver_address', width: 30 },
    { header: '自提点', key: 'pickup_point_name', width: 20 },
    { header: '自提点地址', key: 'pickup_point_address', width: 30 },
    { header: '商品明细', key: 'items_text', width: 40 },
    { header: '实付金额', key: 'total_amount', width: 12 },
    { header: '自提码', key: 'pickup_code', width: 14 },
    { header: '状态', key: 'status_text', width: 12 },
    { header: '支付时间', key: 'paid_at', width: 20 },
    { header: '核销时间', key: 'completed_at', width: 20 }
  ];
  const statusMap = { pending_pay: '待支付', pending_pickup: '待自提', completed: '已核销', closed: '已关闭' };
  for (const o of orders) {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    const itemsText = items.map((it) => `${it.product_name} ${it.sku_spec || ''} x${it.quantity} ￥${it.price}`).join('；');
    ws.addRow({
      ...o,
      items_text: itemsText,
      status_text: statusMap[o.status] || o.status
    });
  }
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FF' } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

// 自提码清单导出：若后台上传了模板，则按模板格式导出；否则用默认样式
router.get('/pickup-codes', requireAuth, requireRole('admin'), async (req, res) => {
  const { status = 'pending_pickup' } = req.query;
  let sql = "SELECT * FROM orders WHERE status IN ('pending_pickup','completed')";
  const params = [];
  if (status && status !== 'all') { sql = "SELECT * FROM orders WHERE status = ?"; params.push(status); }
  sql += ' ORDER BY id DESC';
  const orders = db.prepare(sql).all(...params);

  const statusMap = { pending_pickup: '待自提', completed: '已完成' };
  // 准备每条订单的数据对象（字段名与模板识别字段对应）
  const dataRows = orders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    const itemsText = items.map((it) => `${it.product_name} ${it.sku_spec || ''} x${it.quantity}`).join('；');
    return {
      pickup_code: o.pickup_code,
      phone: o.phone,
      receiver_name: o.receiver_name || '',
      pickup_point_name: o.pickup_point_name || '',
      pickup_point_address: o.pickup_point_address || '',
      items_text: itemsText,
      total_amount: o.total_amount,
      status_text: statusMap[o.status] || o.status,
      order_no: o.order_no,
      created_at: o.created_at,
      paid_at: o.paid_at || '',
      completed_at: o.completed_at || ''
    };
  });

  // 尝试读取后台上传的模板
  const metaRaw = getSetting('pickup_template_meta');
  let useTemplate = false;
  let templateMeta = null;
  if (metaRaw) {
    try {
      templateMeta = JSON.parse(metaRaw);
      const templatePath = path.join(TEMPLATE_DIR, 'pickup_template.xlsx');
      if (fs.existsSync(templatePath) && templateMeta.mapping) useTemplate = true;
    } catch (_) {}
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=pickup_codes_${Date.now()}.xlsx`);

  if (useTemplate) {
    // ===== 按上传模板格式导出：克隆模板，保留表头与列宽样式，从第2行填数据 =====
    const templatePath = path.join(TEMPLATE_DIR, 'pickup_template.xlsx');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);
    const ws = wb.getWorksheet(1) || wb.worksheets[0];
    // 清空表头(第1行)以下的所有旧数据行
    const lastRow = ws.rowCount;
    if (lastRow > 1) {
      ws.spliceRows(2, lastRow - 1);
    }
    const mapping = templateMeta.mapping; // { field: col(1-based) }
    let rowIdx = 2;
    for (const row of dataRows) {
      const r = ws.getRow(rowIdx);
      for (const [field, col] of Object.entries(mapping)) {
        if (row[field] !== undefined) r.getCell(col).value = row[field];
      }
      r.commit();
      rowIdx++;
    }
    await wb.xlsx.write(res);
    res.end();
    return;
  }

  // ===== 默认格式导出（参考《自提码模版.xls》样式） =====
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('自提码清单');
  ws.columns = [
    { header: '自提码', key: 'pickup_code', width: 16 },
    { header: '手机号', key: 'phone', width: 16 },
    { header: '收货人', key: 'receiver_name', width: 14 },
    { header: '自提点', key: 'pickup_point_name', width: 24 },
    { header: '商品', key: 'items_text', width: 36 },
    { header: '金额', key: 'total_amount', width: 10 },
    { header: '状态', key: 'status_text', width: 12 }
  ];
  for (const row of dataRows) ws.addRow(row);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7E6' } };
  // 打印友好：每行较高，便于裁剪
  for (let i = 1; i <= ws.rowCount; i++) ws.getRow(i).height = 28;
  await wb.xlsx.write(res);
  res.end();
});

// 采购单导出（按商品自动汇总数量和预计销量，多商品分开统计）
router.get('/purchase', requireAuth, requireRole('admin'), async (req, res) => {
  const { start, end, status } = req.query;
  // 默认统计待自提 + 已完成（实际产生采购需求的订单）
  let statusIn = "('pending_pickup','completed')";
  const params = [];
  if (status && status !== 'all') {
    statusIn = "(?)";
    params.push(status);
  }
  let sql = `
    SELECT 
      p.id as product_id,
      p.name, 
      p.sku_code, 
      SUM(oi.quantity) as total_quantity, 
      COALESCE(p.stock, 0) as expected_sales, 
      p.price,
      p.unit
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ${statusIn}
  `;
  if (start) { sql += ' AND o.created_at >= ?'; params.push(start); }
  if (end) { sql += ' AND o.created_at <= ?'; params.push(end); }
  sql += ' GROUP BY p.id, p.sku_code ORDER BY total_quantity DESC';

  const products = db.prepare(sql).all(...params);

  // 汇总小计
  const totalQty = products.reduce((s, p) => s + Number(p.total_quantity || 0), 0);
  const totalAmount = products.reduce((s, p) => s + Number(p.total_quantity || 0) * Number(p.price || 0), 0);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('采购单汇总');
  ws.columns = [
    { header: '序号', key: 'idx', width: 6 },
    { header: '商品名称', key: 'name', width: 30 },
    { header: 'SKU编码', key: 'sku_code', width: 18 },
    { header: '单位', key: 'unit', width: 8 },
    { header: '采购数量', key: 'total_quantity', width: 12 },
    { header: '预计销量(库存参考)', key: 'expected_sales', width: 18 },
    { header: '单价(元)', key: 'price', width: 11 },
    { header: '采购金额(元)', key: 'amount', width: 15 }
  ];
  products.forEach((p, i) => {
    ws.addRow({
      idx: i + 1,
      name: p.name,
      sku_code: p.sku_code || '-',
      unit: p.unit || '件',
      total_quantity: Number(p.total_quantity || 0),
      expected_sales: Number(p.expected_sales || 0),
      price: Number(p.price || 0).toFixed(2),
      amount: (Number(p.total_quantity || 0) * Number(p.price || 0)).toFixed(2)
    });
  });
  // 合计行
  const lastRow = ws.addRow({
    idx: '',
    name: '合计',
    sku_code: '',
    unit: '',
    total_quantity: totalQty,
    expected_sales: '',
    price: '',
    amount: totalAmount.toFixed(2)
  });
  lastRow.font = { bold: true };
  lastRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FF' } };

  // 表头样式
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FF1677FF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  // 所有数据行居中对齐（数字列）
  ws.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getColumn(4).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getColumn(5).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getColumn(6).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getColumn(7).alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getColumn(8).alignment = { horizontal: 'right', vertical: 'middle' };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=purchase_${Date.now()}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

export default router;
