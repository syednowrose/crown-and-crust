import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, UtensilsCrossed, Users, DollarSign,
  ShoppingBag, MessageSquare, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/dashboard/foods',     icon: UtensilsCrossed,  label: 'Menu & Foods' },
  { to: '/dashboard/employees', icon: Users,            label: 'Employees'    },
  { to: '/dashboard/finance',   icon: DollarSign,       label: 'Finance'      },
  { to: '/dashboard/orders',    icon: ShoppingBag,      label: 'Orders'       },
  { to: '/dashboard/feedback',  icon: MessageSquare,    label: 'Feedback'     },
]

export default function AppLayout({ children }) {
  const { staffProfile, userRole } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sandalwood-400 to-gold-500 flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg">
            C
          </div>
          {!collapsed && (
            <div>
              <p className="font-serif text-white font-semibold leading-none">Crown & Crust</p>
              <p className="text-sandalwood-300 text-xs mt-0.5 capitalize">{userRole || 'Staff'}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{staffProfile?.name}</p>
            <p className="text-sandalwood-400 text-xs truncate">{staffProfile?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-cream-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col bg-espresso-gradient flex-shrink-0 relative overflow-hidden"
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 right-3 p-1.5 rounded-lg bg-white/10 text-sandalwood-300 hover:text-white hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight size={16} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-espresso-900/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-60 bg-espresso-gradient z-50 md:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-sandalwood-200 px-6 py-4 flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-sandalwood-100 text-espresso-700"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-xl text-espresso-800">Crown & Crust</h1>
            <p className="text-xs text-sandalwood-500">Management Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sandalwood-gradient flex items-center justify-center text-espresso-700 font-semibold text-sm">
              {staffProfile?.name?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
