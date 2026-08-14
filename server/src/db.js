import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'hpy.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',  -- admin | verifier
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      sku_code TEXT UNIQUE NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'off_shelf', -- on_shelf | off_shelf
      main_image TEXT,
      detail_images TEXT,    -- JSON array of paths
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS product_skus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      spec TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      sku_code TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pickup_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact_phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      address TEXT,
      pickup_point_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      phone TEXT NOT NULL,
      receiver_name TEXT,
      receiver_address TEXT,
      pickup_point_id INTEGER,
      pickup_point_name TEXT,
      pickup_point_address TEXT,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_pay', -- pending_pay | pending_pickup | completed | closed
      pickup_code TEXT NOT NULL,
      paid_at TEXT,
      completed_at TEXT,
      closed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      sku_id INTEGER,
      sku_spec TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vip_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      granted_by TEXT NOT NULL,
      granted_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      revoked INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // 默认管理员账号
  const adminExist = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!adminExist) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    const vHash = bcrypt.hashSync('verify123', 10);
    db.prepare('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)').run('verifier', vHash, 'verifier');
  }

  // 默认自提点
  const ppExist = db.prepare('SELECT id FROM pickup_points').get();
  if (!ppExist) {
    db.prepare('INSERT INTO pickup_points (name, address, contact_phone) VALUES (?,?,?)')
      .run('阳光小区门口自提点', '幸福路88号阳光小区南门保安亭旁', '13800000001');
    db.prepare('INSERT INTO pickup_points (name, address, contact_phone) VALUES (?,?,?)')
      .run('中央花园自提点', '中央花园社区服务中心一楼', '13800000002');
  }

  // 默认商品（演示用）
  const pExist = db.prepare('SELECT id FROM products').get();
  if (!pExist) {
    const info = db.prepare(`INSERT INTO products (name, price, sku_code, stock, status, main_image, detail_images)
      VALUES (?,?,?,?,?,?,?)`).run(
      '阿克苏冰糖心苹果', 39.9, 'SKU-APPLE-001', 200, 'on_shelf', null, '[]'
    );
    const pid = info.lastInsertRowid;
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid, '5斤装', 39.9, 120, 'SKU-APPLE-001-A');
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid, '10斤装', 69.9, 80, 'SKU-APPLE-001-B');

    const info2 = db.prepare(`INSERT INTO products (name, price, sku_code, stock, status, main_image, detail_images)
      VALUES (?,?,?,?,?,?,?)`).run(
      '内蒙古草原羔羊肉卷', 59.9, 'SKU-MUTTON-001', 150, 'on_shelf', null, '[]'
    );
    const pid2 = info2.lastInsertRowid;
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid2, '500g/份', 59.9, 100, 'SKU-MUTTON-001-A');
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid2, '1kg/份', 109.9, 50, 'SKU-MUTTON-001-B');

    const info3 = db.prepare(`INSERT INTO products (name, price, sku_code, stock, status, main_image, detail_images)
      VALUES (?,?,?,?,?,?,?)`).run(
      '东北五常稻花香大米', 49.9, 'SKU-RICE-001', 300, 'on_shelf', null, '[]'
    );
    const pid3 = info3.lastInsertRowid;
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid3, '10斤装', 49.9, 200, 'SKU-RICE-001-A');
    db.prepare('INSERT INTO product_skus (product_id, spec, price, stock, sku_code) VALUES (?,?,?,?,?)')
      .run(pid3, '20斤装', 89.9, 100, 'SKU-RICE-001-B');
  }
}

init();

export default db;
