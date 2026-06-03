import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Movements() {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMovements()
  }, [])

  async function loadMovements() {
    try {
      setLoading(true)
      setError('')
      const result = await api.getMovements()
      setMovements(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Betöltés...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Készletmozgások</h2>
        <button onClick={loadMovements} className="text-blue-600 hover:text-blue-800 text-sm">
          🔄 Frissítés
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>}

      {movements.length === 0 ? (
        <p className="text-gray-500 text-sm">Még nincsenek készletmozgások.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Időpont</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Termék</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden md:table-cell">Vonalkód</th>
                <th className="text-center px-4 py-2 text-gray-600 font-medium">Típus</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium">Mennyiség</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium hidden sm:table-cell">Megjegyzés</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString('hu-HU')}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{m.product_name}</td>
                  <td className="px-4 py-2 text-gray-500 hidden md:table-cell font-mono text-xs">{m.barcode}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      m.type === 'bevetelezes'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {m.type === 'bevetelezes' ? 'Bevételezés' : 'Kivételezés'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800 font-medium">{m.quantity}</td>
                  <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{m.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-400 border-t">
            Utolsó 200 mozgás
          </div>
        </div>
      )}
    </div>
  )
}
