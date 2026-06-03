export default function Layout({ pages, currentPage, onNavigate, mobileMenuOpen, onToggleMobile, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fejléc */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">📦 Raktárkezelő</h1>
          <button
            onClick={onToggleMobile}
            className="md:hidden text-white p-1"
            aria-label="Menü"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Oldalsó menü - asztali */}
        <nav className="hidden md:block w-56 bg-white border-r min-h-[calc(100vh-3.5rem)] shadow-sm">
          <div className="py-2">
            {Object.entries(pages).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors text-sm ${
                  currentPage === key
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mobilos menü */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 z-20 bg-black/30" onClick={onToggleMobile}>
            <nav className="bg-white w-56 min-h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="py-2">
                {Object.entries(pages).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm ${
                      currentPage === key
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* Tartalom */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
