import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Stock() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory])

  async function loadProducts() {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (selectedCategory) params.category_id = selectedCategory
      if (search) params.search = search
      const result = await api.getProducts(params)
      setProducts(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    loadProducts()
  }

  function getStatus(product) {
    if (product.current_stock === 0) return { label: 'Elfogyott', color: 'bg-red-100 text-red-700' }
    if (product.current_stock <= product.minimum_stock) return { label: 'Alacsony készlet', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Rendben', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Készlet</h2>

      {/* Szűrők */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">Minden kategória</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés név vagy vonalkód alapján..."
            className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Keresés
          </button>
        </form>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>}

      {loading ? (
        <p className="text-gray-500 text-sm">Betöltés...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-sm">Nincsenek termékek.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Termék</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden sm:table-cell">Kategória</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden md:table-cell">Vonalkód</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium">Készlet</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium hidden sm:table-cell">Minimum</th>
                <th className="text-center px-4 py-2 text-gray-600 font-medium">Státusz</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const status = getStatus(p)
                return (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-gray-600 hidden sm:table-cell">{p.category_name || '-'}</td>
                    <td className="px-4 py-2 text-gray-500 hidden md:table-cell font-mono text-xs">{p.barcode}</td>
                    <td className="px-4 py-2 text-right text-gray-800 font-medium">{p.current_stock} {p.unit}</td>
                    <td className="px-4 py-2 text-right text-gray-500 hidden sm:table-cell">{p.minimum_stock} {p.unit}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
