import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin } from 'lucide-react'
import { customerLogin, customerSignUp } from '../../services/authService'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email:'', password:'', name:'', phone:'', address:'' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await customerLogin({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/customer')
      } else {
        await customerSignUp(form)
        toast.success('Account created! Welcome to Crown & Crust.')
        navigate('/customer')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl text-espresso-800 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-sandalwood-500">
              {mode === 'login' ? 'Sign in to your Crown & Crust account' : 'Create your account and start ordering'}
            </p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                      <input required type="text" placeholder="Your full name" value={form.name} onChange={set('name')} className="input-field pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                      <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} className="input-field pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Delivery Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-sandalwood-400" />
                      <textarea placeholder="123 Main St, City…" value={form.address} onChange={set('address')} rows={2} className="input-field pl-9 resize-none" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="form-label">Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                  <input required type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} className="input-field pl-9" />
                </div>
              </div>

              <div>
                <label className="form-label">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                  <input required type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sandalwood-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="gold" size="lg" loading={loading} className="w-full mt-2">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-sandalwood-500">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sandalwood-600 font-semibold hover:text-espresso-800 transition-colors">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4 text-center border-t border-sandalwood-200 pt-4">
              <Link to="/login" className="text-xs text-sandalwood-400 hover:text-sandalwood-600 transition-colors">
                Are you staff? → Staff Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  )
}
