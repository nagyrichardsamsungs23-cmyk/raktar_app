import { useState } from 'react'
import { api } from '../api'
import BarcodeScanner from '../components/BarcodeScanner'
import ProductSearch from '../components/ProductSearch'

export default function StockOut() {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Vonalkódos keresés
  async function handleBarcodeScan(barcode) {
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

  // Név alapú keresésből választás
  function handleProductSelect(selectedProduct) {
    setMessage('')
    setError('')
    setProduct(selectedProduct)
    setQuantity('1')
  }

  async function handleStockOut(e) {
    e.preventDefault()
    if (!quantity || parseInt(quantity) <= 0) {
      setError('A mennyiségnek pozitív számnak kell lennie.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const result = await api.stockOut({
        product_id: product.id,
        quantity: parseInt(quantity),
        note,
      })
      setMessage(`Sikeres kivételezés! Maradék készlet: ${result.new_stock} ${product.unit}`)
      setProduct(null)
      setQuantity('')
      setNote('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setProduct(null)
    setQuantity('')
    setNote('')
    setError('')
    setMessage('')
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Kivételezés</h2>

      <div className="max-w-lg">
        {/* Keresési módok — csak ha nincs kiválasztott termék */}
        {!product && (
          <>
            {/* Vonalkódos kereső */}
            <BarcodeScanner
              onScan={handleBarcodeScan}
              loading={loading}
              placeholder="Olvasd be vagy írd be a vonalkódot..."
            />

            {/* Elválasztó */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">VAGY</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Terméknév kereső */}
            <ProductSearch
              onSelect={handleProductSelect}
              loading={loading}
            />
          </>
        )}

        {loading && <p className="text-gray-500 text-sm mb-4">Keresés...</p>}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-4">{message}</div>
        )}

        {/* Talált termék */}
        {product && !message && (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 mb-4">
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

            <form onSubmit={handleStockOut}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mennyiség</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={product.current_stock}
                className="border rounded px-3 py-2 text-sm w-32 mb-3"
                autoFocus
              />
              <span className="text-sm text-gray-500 ml-2">{product.unit}</span>
              {product.current_stock < 5 && (
                <span className="text-xs text-orange-600 ml-2">⚠️ Csak {product.current_stock} {product.unit} van készleten</span>
              )}

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés (nem kötelező)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                  placeholder="Pl. munkalap száma..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                📤 Kivételezés
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
