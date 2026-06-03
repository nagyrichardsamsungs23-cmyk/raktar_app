import { useState, useRef, useEffect } from 'react'

export default function BarcodeScanner({ onScan, loading, placeholder }) {
  const [mode, setMode] = useState(null) // null = választás, 'camera' | 'manual'
  const [manualBarcode, setManualBarcode] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const scannerRef = useRef(null)
  const scannerInstanceRef = useRef(null)

  // Kamera lista lekérése
  useEffect(() => {
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      Html5Qrcode.getCameras()
        .then((devices) => {
          setCameras(devices)
          if (devices.length > 0) {
            // Hátsó kamera előnyben, ha van
            const rear = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('hát') || d.label.toLowerCase().includes('környezeti'))
            setSelectedCamera(rear ? rear.id : devices[0].id)
          }
        })
        .catch(() => {
          setCameras([])
        })
    }).catch(() => {})
  }, [])

  // Kamera indítása
  async function startCamera() {
    setCameraError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      if (!Html5Qrcode.getCameras) {
        setCameraError('A böngésző nem támogatja a kamera használatát.')
        return
      }

      const devices = await Html5Qrcode.getCameras()
      if (!devices || devices.length === 0) {
        setCameraError('Nem található kamera az eszközön.')
        return
      }

      setCameras(devices)
      const camId = selectedCamera || devices[0].id

      const scanner = new Html5Qrcode('barcode-scanner-viewfinder')
      scannerInstanceRef.current = scanner

      await scanner.start(
        camId,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          // Sikeres beolvasás
          stopCamera()
          onScan(decodedText)
        },
        () => {
          // Beolvasási hiba (nem talál kódot) - csendben ignoráljuk
        }
      )

      setCameraActive(true)
    } catch (err) {
      console.error('Kamera hiba:', err)
      if (err.message?.includes('Permission')) {
        setCameraError('A kamera használata elutasítva. Kérlek engedélyezd a böngésző beállításaiban.')
      } else {
        setCameraError('Nem sikerült elindítani a kamerát: ' + (err.message || 'ismeretlen hiba'))
      }
    }
  }

  // Kamera leállítása
  async function stopCamera() {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop()
      } catch (e) {
        // Már le van állítva
      }
      scannerInstanceRef.current = null
    }
    setCameraActive(false)
  }

  // Kamera váltás
  async function switchCamera() {
    const currentCam = selectedCamera
    const otherCams = cameras.filter(c => c.id !== currentCam)
    if (otherCams.length === 0) return

    setSelectedCamera(otherCams[0].id)
    await stopCamera()
    // Kis késleltetés után újraindítás
    setTimeout(() => {
      if (scannerInstanceRef.current === null) {
        startCamera()
      }
    }, 500)
  }

  // Kézi bevitel Enter-re
  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualBarcode.trim() || loading) return
    onScan(manualBarcode.trim())
    setManualBarcode('')
  }

  // Takarítás komponens unmount-kor
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(() => {})
      }
    }
  }, [])

  // Vissza a választáshoz
  function goBack() {
    stopCamera()
    setMode(null)
    setCameraError('')
  }

  // ============ VÁLASZTÓ KÉPERNYŐ ============
  if (mode === null) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vonalkód beolvasása
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setMode('camera')
              setTimeout(() => startCamera(), 300)
            }}
            className="flex items-center gap-3 p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl">📷</span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Kamerás olvasás</div>
              <div className="text-xs text-gray-500">Telefon vagy laptop kamerájával</div>
            </div>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <span className="text-3xl">⌨️</span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Kézi / USB bevitel</div>
              <div className="text-xs text-gray-500">Billentyűzet vagy vonalkódolvasó</div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ============ KAMERÁS MÓD ============
  if (mode === 'camera') {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={goBack} className="text-sm text-blue-600 hover:text-blue-800">
            ← Vissza a választáshoz
          </button>
          {cameras.length > 1 && (
            <button onClick={switchCamera} className="text-sm text-gray-600 hover:text-gray-800">
              🔄 Kamera váltás
            </button>
          )}
        </div>

        {cameraError && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded text-sm mb-3">
            <p className="font-medium mb-1">⚠️ {cameraError}</p>
            <button
              onClick={() => setMode('manual')}
              className="text-blue-600 hover:text-blue-800 underline mt-1"
            >
              Váltás kézi bevitelre
            </button>
          </div>
        )}

        {/* Kamera viewfinder */}
        <div
          id="barcode-scanner-viewfinder"
          className={`bg-black rounded-lg overflow-hidden ${cameraActive ? 'border-2 border-green-400' : 'border-2 border-gray-300'}`}
          style={{ minHeight: cameraActive ? 'auto' : '250px' }}
        />

        {!cameraActive && !cameraError && (
          <div className="text-center py-3">
            <div className="animate-pulse text-gray-400 text-sm">Kamera indítása...</div>
          </div>
        )}

        {cameraActive && (
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">
              Helyezd a vonalkódot a kamerába. A beolvasás automatikus.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ============ KÉZI / USB MÓD ============
  if (mode === 'manual') {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={goBack} className="text-sm text-blue-600 hover:text-blue-800">
            ← Vissza a választáshoz
          </button>
          {cameras.length > 0 && (
            <button onClick={() => { setMode('camera'); setTimeout(() => startCamera(), 300) }} className="text-sm text-gray-600 hover:text-gray-800">
              📷 Váltás kamerára
            </button>
          )}
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder={placeholder || 'Olvasd be vagy írd be a vonalkódot...'}
            className="barcode-input border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoComplete="off"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !manualBarcode.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Keresés
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1">
          Külső vonalkódolvasó esetén csak olvasd be a kódot — az Enter-t automatikusan küldi.
        </p>
      </div>
    )
  }

  return null
}
