import { supabase } from './supabaseClient'

// ─── Staff Auth ───────────────────────────────────────────────
export const staffSignUp = async ({ email, password, name, role }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  // Insert staff profile
  const { error: profileError } = await supabase
    .from('staff_profiles')
    .insert({ id: data.user.id, name, role, email })
  if (profileError) throw profileError

  return data
}

export const staffLogin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  // Fetch role
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return { session: data, profile }
}

// ─── Customer Auth ────────────────────────────────────────────
export const customerSignUp = async ({ email, password, name, phone, address }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  const { error: profileError } = await supabase
    .from('customers')
    .insert({ id: data.user.id, name, email, phone, address })
  if (profileError) throw profileError

  return data
}

export const customerLogin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const { data: profile } = await supabase
    .from('customers')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return { session: data, profile }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}
