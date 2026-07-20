import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabaseClient'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import { User, Phone, MapPin, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerProfile() {
  const { user, customerProfile, refreshProfile } = useAuth()
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customerProfile) {
      setFormData({
        name: customerProfile.name || '',
        phone: customerProfile.phone || '',
        address: customerProfile.address || ''
      })
    }
  }, [customerProfile])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        })
        .eq('id', user.id)

      if (error) throw error
      
      await refreshProfile()
      toast.success('Profile updated successfully!', { icon: '✨' })
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <CustomerLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-espresso-800 mb-8 text-center">My Profile</h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                <input
                  required
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Default Delivery Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-sandalwood-400" />
                <textarea
                  placeholder="123 Bakery Lane, Confection City..."
                  value={formData.address}
                  onChange={handleChange('address')}
                  rows={4}
                  className="input-field pl-9 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Registered Email</label>
              <input
                disabled
                type="email"
                value={user?.email || ''}
                className="input-field bg-sandalwood-50 border-sandalwood-100 text-sandalwood-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-sandalwood-400 mt-1">Email address cannot be changed.</p>
            </div>

            <Button
              type="submit"
              variant="gold"
              loading={saving}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle size={16} /> Save Profile Changes
            </Button>
          </form>
        </motion.div>
      </div>
    </CustomerLayout>
  )
}
