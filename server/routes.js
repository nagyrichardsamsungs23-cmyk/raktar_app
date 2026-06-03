import { getDb } from './database.js'

export function setupApi(app) {

  // ===================== IRÁNYÍTÓPULT =====================

  app.get('/api/dashboard', (_req, res) => {
    const db = getDb()
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count
    const lowStock = db.prepare(
      'SELECT COUNT(*) as count FROM products WHERE current_stock <= minimum_stock AND current_stock > 0'
    ).get().count
    const outOfStock = db.prepare(
      'SELECT COUNT(*) as count FROM products WHERE current_stock = 0'
    ).get().count
    const recentMovements = db.prepare(`
      SELECT sm.*, p.name as product_name, p.barcode
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 5
    `).all()

    res.json({ totalProducts, lowStock, outOfStock, recentMovements })
  })

  // ===================== KATEGÓRIÁK =====================

  app.get('/api/categories', (_req, res) => {
    const db = getDb()
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all()
    res.json(categories)
  })

  app.post('/api/categories', (req, res) => {
    const db = getDb()
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'A kategória neve kötelező.' })
    }
    try {
      const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim())
      res.status(201).json({ id: result.lastInsertRowid, name: name.trim() })
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ilyen nevű kategória már létezik.' })
      }
      throw e
    }
  })

  app.put('/api/categories/:id', (req, res) => {
    const db = getDb()
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'A kategória neve kötelező.' })
    }
    try {
      db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), req.params.id)
      res.json({ id: parseInt(req.params.id), name: name.trim() })
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ilyen nevű kategória már létezik.' })
      }
      throw e
    }
  })

  app.delete('/api/categories/:id', (req, res) => {
    const db = getDb()
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  })

  // ===================== TERMÉKEK =====================

  app.get('/api/products', (req, res) => {
    const db = getDb()
    const { category_id, search } = req.query

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params = []

    if (category_id) {
      query += ' AND p.category_id = ?'
      params.push(category_id)
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY p.name'

    const products = db.prepare(query).all(...params)
    res.json(products)
  })

  app.get('/api/products/barcode/:barcode', (req, res) => {
    const db = getDb()
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.barcode = ?
    `).get(req.params.barcode)

    if (!product) {
      return res.status(404).json({ error: 'Nincs ilyen vonalkódú termék.' })
    }
    res.json(product)
  })

  app.get('/api/products/:id', (req, res) => {
    const db = getDb()
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id)

    if (!product) {
      return res.status(404).json({ error: 'A termék nem található.' })
    }
    res.json(product)
  })

  app.post('/api/products', (req, res) => {
    const db = getDb()
    const { name, barcode, category_id, unit, minimum_stock, current_stock, note } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'A termék neve kötelező.' })
    }
    if (!barcode || !barcode.trim()) {
      return res.status(400).json({ error: 'A vonalkód kötelező.' })
    }
    if (current_stock !== undefined && current_stock < 0) {
      return res.status(400).json({ error: 'A készlet nem lehet negatív.' })
    }

    try {
      const result = db.prepare(`
        INSERT INTO products (name, barcode, category_id, unit, minimum_stock, current_stock, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name.trim(),
        barcode.trim(),
        category_id || null,
        unit || 'db',
        minimum_stock || 0,
        current_stock || 0,
        note || ''
      )
      res.status(201).json({ id: result.lastInsertRowid })
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ilyen vonalkódú termék már létezik.' })
      }
      throw e
    }
  })

  app.put('/api/products/:id', (req, res) => {
    const db = getDb()
    const { name, barcode, category_id, unit, minimum_stock, current_stock, note } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'A termék neve kötelező.' })
    }
    if (!barcode || !barcode.trim()) {
      return res.status(400).json({ error: 'A vonalkód kötelező.' })
    }

    try {
      db.prepare(`
        UPDATE products
        SET name = ?, barcode = ?, category_id = ?, unit = ?, minimum_stock = ?, current_stock = ?, note = ?
        WHERE id = ?
      `).run(
        name.trim(),
        barcode.trim(),
        category_id || null,
        unit || 'db',
        minimum_stock || 0,
        current_stock || 0,
        note || '',
        req.params.id
      )
      res.json({ success: true })
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ilyen vonalkódú termék már létezik.' })
      }
      throw e
    }
  })

  app.delete('/api/products/:id', (req, res) => {
    const db = getDb()
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  })

  // ===================== BEVÉTELEZÉS =====================

  app.post('/api/stock/in', (req, res) => {
    const db = getDb()
    const { product_id, quantity, note } = req.body

    if (!product_id) {
      return res.status(400).json({ error: 'Termék azonosító kötelező.' })
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'A mennyiségnek pozitív számnak kell lennie.' })
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id)
    if (!product) {
      return res.status(404).json({ error: 'A termék nem található.' })
    }

    const updateStock = db.prepare('UPDATE products SET current_stock = current_stock + ? WHERE id = ?')
    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (product_id, type, quantity, note)
      VALUES (?, 'bevetelezes', ?, ?)
    `)

    const transaction = db.transaction(() => {
      updateStock.run(quantity, product_id)
      insertMovement.run(product_id, quantity, note || '')
    })

    transaction()
    res.json({ success: true, new_stock: product.current_stock + quantity })
  })

  // ===================== KIVÉTELEZÉS =====================

  app.post('/api/stock/out', (req, res) => {
    const db = getDb()
    const { product_id, quantity, note } = req.body

    if (!product_id) {
      return res.status(400).json({ error: 'Termék azonosító kötelező.' })
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'A mennyiségnek pozitív számnak kell lennie.' })
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id)
    if (!product) {
      return res.status(404).json({ error: 'A termék nem található.' })
    }

    if (product.current_stock < quantity) {
      return res.status(400).json({ error: 'Nincs elegendő készlet.' })
    }

    const updateStock = db.prepare('UPDATE products SET current_stock = current_stock - ? WHERE id = ?')
    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (product_id, type, quantity, note)
      VALUES (?, 'kivetelezes', ?, ?)
    `)

    const transaction = db.transaction(() => {
      updateStock.run(quantity, product_id)
      insertMovement.run(product_id, quantity, note || '')
    })

    transaction()
    res.json({ success: true, new_stock: product.current_stock - quantity })
  })

  // ===================== KÉSZLETMOZGÁSOK =====================

  app.get('/api/movements', (req, res) => {
    const db = getDb()
    const movements = db.prepare(`
      SELECT sm.*, p.name as product_name, p.barcode
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 200
    `).all()

    res.json(movements)
  })
}
