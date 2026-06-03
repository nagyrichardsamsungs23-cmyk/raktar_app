import { useState, useRef, useEffect } from 'react'

export default function BarcodeScanButton({ onScan, disabled }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('camera') // 'camera' | 'manual'
  const [manualText, setManualText] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const scannerRef = useRef(null)

  // Kamera lista lekérése
  useEffect(() => {
    if (!open) return
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      Html5Qrcode.getCameras()
        .then((devices) => {
          setCameras(devices)
          if (devices.length > 0) {
            const rear = devices.find(d =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('hát') ||
              d.label.toLowerCase().includes('környezeti')
            )
            setSelectedCamera(rear ? rear.id : devices[0].id)
          }
        })
        .catch(() => setCameras([]))
    }).catch(() => {})
  }, [open])

  // Kamera indítása
  useEffect(() => {
    if (!open || mode !== 'camera') return

    const timer = setTimeout(() => startCamera(), 400)
    return () => clearTimeout(timer)
  }, [open, mode, selectedCamera])

  async function startCamera() {
    setCameraError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const devices = await Html5Qrcode.getCameras()
      if (!devices || devices.length === 0) {
        setCameraError('Nem található kamera.')
        setMode('manual')
        return
      }
      setCameras(devices)
      const camId = selectedCamera || devices[0].id

      const scanner = new Html5Qrcode('barcode-scanbutton-viewfinder')
      scannerRef.current = scanner

      await scanner.start(
        camId,
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.333 },
        (decodedText) => {
          stopCamera()
          onScan(decodedText)
          close()
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err) {
      if (err.message?.includes('Permission')) {
        setCameraError('Kamera elutasítva. Használd a kézi bevitelt.')
      } else {
        setCameraError('Kamera hiba: ' + (err.message || 'ismeretlen'))
      }
    }
  }

  async function stopCamera() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch (e) {}
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  function close() {
    stopCamera()
    setOpen(false)
    setMode('camera')
    setManualText('')
    setCameraError('')
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualText.trim()) return
    onScan(manualText.trim())
    close()
  }

  return (
    <>
      {/* Gomb */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-100 disabled:opacity-50 transition-colors"
        title="Vonalkód beolvasása kamerával"
      >
        📷 Beolvasás
      </button>

      {/* Felugró ablak */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Fejléc */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Vonalkód beolvasása</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>

            {/* Mód választó fülek */}
            <div className="flex border-b">
              <button
                onClick={() => setMode('camera')}
                className={`flex-1 py-2 text-sm font-medium ${mode === 'camera' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              >
                📷 Kamera
              </button>
              <button
                onClick={() => { setMode('manual'); stopCamera() }}
                className={`flex-1 py-2 text-sm font-medium ${mode === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              >
                ⌨️ Kézi
              </button>
            </div>

            {/* Tartalom */}
            <div className="p-4">
              {mode === 'camera' ? (
                <div>
                  {cameraError && (
                    <div className="bg-orange-50 text-orange-700 p-3 rounded text-sm mb-3">
                      {cameraError}
                    </div>
                  )}

                  <div
                    id="barcode-scanbutton-viewfinder"
                    className="rounded-lg overflow-hidden border-2 border-gray-300 bg-black"
                    style={{ minHeight: '240px' }}
                  />

                  {!cameraActive && !cameraError && (
                    <p className="text-center text-sm text-gray-400 mt-3">Kamera indítása...</p>
                  )}

                  {cameraActive && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Helyezd a vonalkódot a kamerába
                    </p>
                  )}

                  {cameras.length > 1 && (
                    <button
                      onClick={async () => {
                        const next = cameras.find(c => c.id !== selectedCamera)
                        if (next) {
                          setSelectedCamera(next.id)
                          await stopCamera()
                          setTimeout(() => startCamera(), 300)
                        }
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      🔄 Kamera váltás
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleManualSubmit}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vonalkód beírása
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Írd be a vonalkódot..."
                      className="border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      autoFocus
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      disabled={!manualText.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
