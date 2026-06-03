import { useState, useRef, useEffect } from 'react'
import { api } from '../api'

export default function StockIn() {
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleBarcodeSubmit(e) {
    e.preventDefault()
    if (!barcode.trim()) return

    setMessage('')
    setError('')
    setProduct(null)
    setQuantity('')
    setLoading(true)

    try {
      const result = await api.getProductByBarcode(barcode.trim())
      setProduct(result)
      setQuantity('1')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStockIn(e) {
    e.preventDefault()
    if (!quantity || parseInt(quantity) <= 0) {
      setError('A mennyiségnek pozitív számnak kell lennie.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const result = await api.stockIn({
        product_id: product.id,
        quantity: parseInt(quantity),
        note,
      })
      setMessage(`Sikeres bevételezés! Új készlet: ${result.new_stock} ${product.unit}`)
      setBarcode('')
      setProduct(null)
      setQuantity('')
      setNote('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function reset() {
    setBarcode('')
    setProduct(null)
    setQuantity('')
    setNote('')
    setError('')
    setMessage('')
    inputRef.current?.focus()
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Bevételezés</h2>

      <div className="max-w-lg">
        {/* Vonalkód beolvasó */}
        <form onSubmit={handleBarcodeSubmit} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vonalkód beolvasása vagy beírása
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Olvasd be vagy írd be a vonalkódot..."
              className="barcode-input border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !barcode.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Keresés
            </button>
          </div>
        </form>

        {loading && <p className="text-gray-500 text-sm mb-4">Keresés...</p>}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-4">{message}</div>
        )}

        {/* Talált termék */}
        {product && !message && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  {product.category_name || 'Nincs kategória'} | Vonalkód: {product.barcode}
                </p>
                <p className="text-sm text-gray-500">
                  Jelenlegi készlet: <span className="font-medium">{product.current_stock} {product.unit}</span>
                </p>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600 text-sm">
                ✕ Mégse
              </button>
            </div>

            <form onSubmit={handleStockIn}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mennyiség</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="border rounded px-3 py-2 text-sm w-32 mb-3"
                autoFocus
              />
              <span className="text-sm text-gray-500 ml-2">{product.unit}</span>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés (nem kötelező)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                  placeholder="Pl. szállítólevél száma..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                📥 Bevételezés
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
