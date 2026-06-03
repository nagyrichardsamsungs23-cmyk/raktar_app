import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Stock from './pages/Stock'
import StockIn from './pages/StockIn'
import StockOut from './pages/StockOut'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Movements from './pages/Movements'

const pages = {
  dashboard: { label: 'Irányítópult', component: Dashboard, icon: '📊' },
  stock: { label: 'Készlet', component: Stock, icon: '📦' },
  stockIn: { label: 'Bevételezés', component: StockIn, icon: '📥' },
  stockOut: { label: 'Kivételezés', component: StockOut, icon: '📤' },
  products: { label: 'Termékek', component: Products, icon: '🏷️' },
  categories: { label: 'Kategóriák', component: Categories, icon: '📁' },
  movements: { label: 'Mozgások', component: Movements, icon: '📋' },
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const PageComponent = pages[currentPage].component

  return (
    <Layout
      pages={pages}
      currentPage={currentPage}
      onNavigate={(page) => {
        setCurrentPage(page)
        setMobileMenuOpen(false)
      }}
      mobileMenuOpen={mobileMenuOpen}
      onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      <PageComponent />
    </Layout>
  )
}
