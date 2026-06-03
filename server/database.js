import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'raktar.db')

let db

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initTables()
    seedIfEmpty()
  }
  return db
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT NOT NULL UNIQUE,
      category_id INTEGER,
      unit TEXT NOT NULL DEFAULT 'db',
      minimum_stock INTEGER NOT NULL DEFAULT 0,
      current_stock INTEGER NOT NULL DEFAULT 0,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('bevetelezes', 'kivetelezes')),
      quantity INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `)
}

function seedIfEmpty() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get()
  if (catCount.count > 0) return

  const categories = [
    'Konnektorok', 'Klímák', 'Vezetékek', 'Kapcsolók',
    'Csavarok', 'Szerszámok', 'Egyéb'
  ]

  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)')
  for (const cat of categories) {
    insertCat.run(cat)
  }

  const insertProd = db.prepare(`
    INSERT INTO products (name, barcode, category_id, unit, minimum_stock, current_stock, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  insertProd.run('Schneider konnektor', '5991234567890', 1, 'db', 10, 25, '')
  insertProd.run('Réz vezeték 3x1,5', '5999876543210', 3, 'méter', 50, 120, '')
  insertProd.run('Klíma beltéri egység', '5991111222233', 2, 'db', 2, 5, '')
}
