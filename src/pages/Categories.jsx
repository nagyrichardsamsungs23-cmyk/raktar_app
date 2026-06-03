import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      setError('')
      const result = await api.getCategories()
      setCategories(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setError('')
    try {
      await api.createCategory(newName.trim())
      setNewName('')
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpdate(id, name) {
    if (!name.trim()) return
    setError('')
    try {
      await api.updateCategory(id, name.trim())
      setEditing(null)
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await api.deleteCategory(id)
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Betöltés...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Kategóriák</h2>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>}

      {/* Új kategória */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-4 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Új kategória neve..."
          className="border rounded px-3 py-2 text-sm flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          Hozzáadás
        </button>
      </form>

      {/* Kategórialista */}
      <div className="bg-white rounded-lg shadow-sm border max-w-md">
        {categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Még nincsenek kategóriák.</p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.id} className="border-t first:border-t-0">
                {editing === c.id ? (
                  <div className="flex gap-2 p-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border rounded px-2 py-1 text-sm flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(c.id, editName)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Mentés
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs"
                    >
                      Mégse
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-800">{c.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(c.id); setEditName(c.name) }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Szerkesztés
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
