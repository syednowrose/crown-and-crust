import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null)
  const [staffProfile, setStaffProfile] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [loading, setLoading]     = useState(true)

  const loadProfile = async (uid) => {
    // Try staff profile first
    const { data: staff } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', uid)
      .single()

    if (staff) {
      setStaffProfile(staff)
      setCustomerProfile(null)
      return
    }

    // Try customer profile
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', uid)
      .single()

    if (customer) {
      setCustomerProfile(customer)
      setStaffProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setStaffProfile(null)
          setCustomerProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isStaff    = !!staffProfile
  const isCustomer = !!customerProfile
  const userRole   = staffProfile?.role || null

  const value = {
    user,
    staffProfile,
    customerProfile,
    isStaff,
    isCustomer,
    userRole,
    loading,
    refreshProfile: () => user && loadProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
