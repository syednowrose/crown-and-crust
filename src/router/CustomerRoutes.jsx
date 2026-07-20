import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CustomerLayout from '../components/layout/CustomerLayout'

export default function CustomerRoutes({ children }) {
  const { user, isCustomer, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-8 h-8 border-2 border-sandalwood-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isCustomer) {
    return <Navigate to="/customer/login" replace />
  }

  return <CustomerLayout>{children}</CustomerLayout>
}
