import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')
      const result = await api.dashboard()
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Betöltés...</p>
  if (error) return <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
  if (!data) return null

  const cards = [
    { label: 'Összes termék', value: data.totalProducts, color: 'bg-blue-500', icon: '📦' },
    { label: 'Alacsony készlet', value: data.lowStock, color: 'bg-orange-500', icon: '⚠️' },
    { label: 'Elfogyott', value: data.outOfStock, color: 'bg-red-500', icon: '❌' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Irányítópult</h2>

      {/* Kártyák */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Utolsó mozgások */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-800">Utolsó 5 készletmozgás</h3>
        </div>
        {data.recentMovements.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Még nincsenek készletmozgások.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Időpont</th>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Termék</th>
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Típus</th>
                  <th className="text-right px-4 py-2 text-gray-600 font-medium">Mennyiség</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMovements.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2 text-gray-600">{new Date(m.created_at).toLocaleString('hu-HU')}</td>
                    <td className="px-4 py-2 text-gray-800">{m.product_name}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        m.type === 'bevetelezes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {m.type === 'bevetelezes' ? 'Bevételezés' : 'Kivételezés'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-800">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
