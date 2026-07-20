import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'
import useCartStore from '../../store/useCartStore'
import toast from 'react-hot-toast'

export default function CustomerLayout({ children }) {
  const { isCustomer, customerProfile } = useAuth()
  const navigate = useNavigate()
  const totalItems = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0))
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success('See you soon!')
    navigate('/customer/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sandalwood-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/customer" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-espresso-gradient flex items-center justify-center text-white font-serif font-bold shadow">
              C
            </div>
            <span className="font-serif text-xl text-espresso-800 group-hover:text-sandalwood-600 transition-colors">
              Crown & Crust
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/customer" className="text-espresso-700 hover:text-sandalwood-600 font-medium transition-colors text-sm">Home</Link>
            <Link to="/customer/menu" className="text-espresso-700 hover:text-sandalwood-600 font-medium transition-colors text-sm">Menu</Link>
            {isCustomer && (
              <>
                <Link to="/customer/orders" className="text-espresso-700 hover:text-sandalwood-600 font-medium transition-colors text-sm">My Orders</Link>
                <Link to="/customer/profile" className="text-espresso-700 hover:text-sandalwood-600 font-medium transition-colors text-sm">Profile</Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/customer/cart" className="relative p-2 rounded-xl hover:bg-sandalwood-100 transition-colors">
              <ShoppingCart size={22} className="text-espresso-700" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-espresso-800 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {isCustomer ? (
              <div className="flex items-center gap-2">
                <Link to="/customer/profile" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sandalwood-100 hover:bg-sandalwood-200 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-sandalwood-500 flex items-center justify-center text-white text-xs font-semibold">
                    {customerProfile?.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <span className="text-espresso-700 text-sm font-medium">{customerProfile?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="hidden md:flex p-2 rounded-xl hover:bg-red-50 text-espresso-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/customer/login" className="hidden md:block btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-sandalwood-100 transition-colors"
            >
              {menuOpen ? <X size={22} className="text-espresso-700" /> : <Menu size={22} className="text-espresso-700" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-sandalwood-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <Link to="/customer" className="block py-2 text-espresso-700 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/customer/menu" className="block py-2 text-espresso-700 font-medium" onClick={() => setMenuOpen(false)}>Menu</Link>
                {isCustomer ? (
                  <>
                    <Link to="/customer/orders" className="block py-2 text-espresso-700 font-medium" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    <Link to="/customer/profile" className="block py-2 text-espresso-700 font-medium" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="block py-2 text-red-500 font-medium w-full text-left">Logout</button>
                  </>
                ) : (
                  <Link to="/customer/login" className="block py-2 text-sandalwood-600 font-semibold" onClick={() => setMenuOpen(false)}>Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page */}
      <main className="flex-1">
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-espresso-gradient text-sandalwood-300 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-serif text-white text-lg mb-3">Crown & Crust</h4>
            <p className="text-sm leading-relaxed">Artisanal bakery crafting premium breads, pastries & cakes with love.</p>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Quick Links</h5>
            <div className="space-y-1 text-sm">
              <Link to="/customer" className="block hover:text-white transition-colors">Home</Link>
              <Link to="/customer/menu" className="block hover:text-white transition-colors">Menu</Link>
              <Link to="/customer/cart" className="block hover:text-white transition-colors">Cart</Link>
            </div>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Contact</h5>
            <p className="text-sm">📍 123 Bakery Lane, Confection City</p>
            <p className="text-sm mt-1">📞 +91 98765 43210</p>
            <p className="text-sm mt-1">✉️ hello@crowncrust.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/10 text-center text-xs">
          © {new Date().getFullYear()} Crown & Crust. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
