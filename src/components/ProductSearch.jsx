import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function ProductSearch({ onSelect, loading: parentLoading }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const debounceRef = useRef(null)

  // Debounce-olt keresés
  const search = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setResults([])
      setShowDropdown(false)
      setError('')
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getProducts({ search: trimmed })
        setResults(data)
        setShowDropdown(data.length > 0)
        setSelectedIndex(-1)
        if (data.length === 0) {
          setError('Nincs találat.')
        }
      } catch (err) {
        setError(err.message)
        setResults([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  // Input változás
  function handleInputChange(e) {
    const value = e.target.value
    setQuery(value)
    search(value)
  }

  // Termék kiválasztása
  function handleSelect(product) {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    setError('')
    onSelect(product)
  }

  // Billentyűzet kezelés (nyilak + Enter)
  function handleKeyDown(e) {
    if (!showDropdown || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  // Kattintás kívül -> dropdown bezárása
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Takarítás unmountkor
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        🔍 Keresés termék név alapján
      </label>

      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true)
          }}
          placeholder="Gépeld be a termék nevét (min. 2 karakter)..."
          className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          autoComplete="off"
          disabled={parentLoading}
        />

        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Lenyíló találati lista */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    {product.barcode && (
                      <span className="text-gray-400 ml-2 text-xs">{product.barcode}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.current_stock} {product.unit}
                  </span>
                </div>
                {product.category_name && (
                  <div className="text-xs text-gray-400">{product.category_name}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-gray-400 mt-1">{error}</p>
      )}

      {!loading && !error && query.trim().length < 2 && query.trim().length > 0 && (
        <p className="text-xs text-gray-400 mt-1">Gépelj legalább 2 karaktert a kereséshez...</p>
      )}
    </div>
  )
}
