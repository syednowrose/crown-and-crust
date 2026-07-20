import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'

// Route Guards
import StaffRoutes from './router/StaffRoutes'
import CustomerRoutes from './router/CustomerRoutes'

// Staff Pages
import StaffLogin from './pages/staff/Login'
import StaffDashboard from './pages/staff/Dashboard'
import FoodManagement from './pages/staff/FoodManagement'
import EmployeeManagement from './pages/staff/EmployeeManagement'
import Finance from './pages/staff/Finance'
import OrdersAdmin from './pages/staff/Orders'
import FeedbackAdmin from './pages/staff/FeedbackAdmin'

// Customer Pages
import CustomerLogin from './pages/customer/Login'
import CustomerHome from './pages/customer/Home'
import CustomerMenu from './pages/customer/Menu'
import CustomerCart from './pages/customer/Cart'
import CustomerCheckout from './pages/customer/Checkout'
import CustomerOrders from './pages/customer/OrderHistory'
import CustomerProfile from './pages/customer/Profile'

// Create React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main redirects */}
            <Route path="/" element={<Navigate to="/customer" replace />} />

            {/* ─── STAFF PORTAL ────────────────────────────────────── */}
            <Route path="/login" element={<StaffLogin />} />
            
            {/* Protected Staff Routes */}
            <Route path="/dashboard" element={<StaffRoutes><StaffDashboard /></StaffRoutes>} />
            <Route path="/dashboard/foods" element={<StaffRoutes><FoodManagement /></StaffRoutes>} />
            <Route path="/dashboard/employees" element={<StaffRoutes><EmployeeManagement /></StaffRoutes>} />
            <Route path="/dashboard/finance" element={<StaffRoutes><Finance /></StaffRoutes>} />
            <Route path="/dashboard/orders" element={<StaffRoutes><OrdersAdmin /></StaffRoutes>} />
            <Route path="/dashboard/feedback" element={<StaffRoutes><FeedbackAdmin /></StaffRoutes>} />

            {/* ─── CUSTOMER STOREFRONT ─────────────────────────────── */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/menu" element={<CustomerMenu />} />
            <Route path="/customer/cart" element={<CustomerCart />} />
            
            {/* Protected Customer Routes */}
            <Route path="/customer/checkout" element={<CustomerRoutes><CustomerCheckout /></CustomerRoutes>} />
            <Route path="/customer/orders" element={<CustomerRoutes><CustomerOrders /></CustomerRoutes>} />
            <Route path="/customer/profile" element={<CustomerRoutes><CustomerProfile /></CustomerRoutes>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Routes>
          
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-sans text-espresso-800 bg-cream-50 border border-sandalwood-200 rounded-xl shadow-md',
              duration: 3000,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
