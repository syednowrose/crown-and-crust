import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../components/layout/AppLayout'

export default function StaffRoutes({ children }) {
  const { user, isStaff, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sandalwood-gradient flex items-center justify-center text-white font-serif font-bold text-xl animate-pulse">C</div>
          <p className="text-sandalwood-500 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user || !isStaff) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout>{children}</AppLayout>
}
