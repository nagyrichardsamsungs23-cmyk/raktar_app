import { useState, useEffect } from 'react'
import { api } from '../api'

const emptyProduct = {
  name: '', barcode: '', category_id: '', unit: 'db',
  minimum_stock: 0, current_stock: 0, note: ''
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyProduct })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [prods, cats] = await Promise.all([api.getProducts(), api.getCategories()])
      setProducts(prods)
      setCategories(cats)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setForm({ ...emptyProduct })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      barcode: product.barcode,
      category_id: product.category_id || '',
      unit: product.unit,
      minimum_stock: product.minimum_stock,
      current_stock: product.current_stock,
      note: product.note || ''
    })
    setEditing(product.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.updateProduct(editing, form)
      } else {
        await api.createProduct(form)
      }
      setShowForm(false)
      setEditing(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await api.deleteProduct(id)
      setDeleteConfirm(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Betöltés...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Termékek</h2>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Új termék
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>}

      {/* Űrlap */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {editing ? 'Termék szerkesztése' : 'Új termék'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Név *</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded px-3 py-2 text-sm w-full" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vonalkód *</label>
                <input
                  type="text" value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="border rounded px-3 py-2 text-sm w-full" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategória</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="border rounded px-3 py-2 text-sm w-full bg-white"
                >
                  <option value="">-- Válassz --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mértékegység</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="border rounded px-3 py-2 text-sm w-full bg-white"
                >
                  <option value="db">db</option>
                  <option value="méter">méter</option>
                  <option value="csomag">csomag</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="tekercs">tekercs</option>
                  <option value="doboz">doboz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum készlet</label>
                <input
                  type="number" value={form.minimum_stock}
                  onChange={(e) => setForm({ ...form, minimum_stock: parseInt(e.target.value) || 0 })}
                  className="border rounded px-3 py-2 text-sm w-full" min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aktuális készlet</label>
                <input
                  type="number" value={form.current_stock}
                  onChange={(e) => setForm({ ...form, current_stock: parseInt(e.target.value) || 0 })}
                  className="border rounded px-3 py-2 text-sm w-full" min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
              <input
                type="text" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                {editing ? 'Mentés' : 'Létrehozás'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">
                Mégse
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Törlés megerősítés */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <p className="text-gray-800 mb-4">Biztosan törölni szeretnéd ezt a terméket?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm">
                Mégse
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terméklista */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">Még nincsenek termékek.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Név</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden md:table-cell">Vonalkód</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden sm:table-cell">Kategória</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium">Készlet</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500 hidden md:table-cell font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-2 text-gray-600 hidden sm:table-cell">{p.category_name || '-'}</td>
                  <td className="px-4 py-2 text-right text-gray-800">{p.current_stock} {p.unit}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 mr-2 text-xs">
                      Szerkesztés
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="text-red-600 hover:text-red-800 text-xs">
                      Törlés
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
