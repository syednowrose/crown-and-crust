import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Shield } from 'lucide-react'
import { staffLogin, staffSignUp } from '../../services/authService'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const ROLES = ['admin', 'manager', 'baker', 'delivery']

export default function StaffLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'baker' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await staffLogin({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        await staffSignUp(form)
        toast.success('Account created! Please log in.')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-sandalwood-gradient">
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-espresso-gradient p-12 relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-sandalwood-500/10 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold-500/10 translate-x-1/2 translate-y-1/2" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-sandalwood-400 to-gold-500 flex items-center justify-center shadow-2xl mb-8">
            <span className="font-serif text-white text-5xl font-bold">C</span>
          </div>
          <h1 className="font-serif text-5xl text-white mb-4 leading-tight">Crown<br/>&amp; Crust</h1>
          <p className="text-sandalwood-300 text-lg italic">Management Portal</p>
          <div className="mt-8 text-sandalwood-400 text-sm space-y-1">
            <p>🥐 Premium Artisanal Bakery</p>
            <p>📊 Full Management Dashboard</p>
            <p>🚀 Real-time Order Tracking</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="w-14 h-14 rounded-2xl bg-espresso-gradient flex items-center justify-center shadow-lg">
                  <span className="font-serif text-white text-2xl font-bold">C</span>
                </div>
              </div>
              <h2 className="font-serif text-2xl text-espresso-800">
                {mode === 'login' ? 'Staff Login' : 'Create Account'}
              </h2>
              <p className="text-sandalwood-500 text-sm mt-1">
                {mode === 'login' ? 'Access your management dashboard' : 'Join the Crown & Crust team'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                    <input type="text" required placeholder="Your name" value={form.name} onChange={set('name')}
                      className="input-field pl-9" />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                  <input type="email" required placeholder="staff@crowncrust.com" value={form.email} onChange={set('email')}
                    className="input-field pl-9" />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                  <input type={showPw ? 'text' : 'password'} required placeholder="••••••••" value={form.password} onChange={set('password')}
                    className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sandalwood-400 hover:text-espresso-700">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="form-label">Role</label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                    <select value={form.role} onChange={set('role')} className="input-field pl-9 appearance-none">
                      {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-sandalwood-500">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sandalwood-600 font-medium hover:text-espresso-800 transition-colors">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/customer" className="text-xs text-sandalwood-400 hover:text-sandalwood-600 transition-colors">
                ← Go to Customer Storefront
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
