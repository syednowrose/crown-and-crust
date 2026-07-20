import { supabase } from './supabaseClient'

export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('joining_date', { ascending: false })
  if (error) throw error
  return data
}

export const createEmployee = async (emp) => {
  const { data, error } = await supabase.from('employees').insert(emp).select().single()
  if (error) throw error
  return data
}

export const updateEmployee = async (id, updates) => {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteEmployee = async (id) => {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
}

export const getSalaryHistory = async (employeeId) => {
  const { data, error } = await supabase
    .from('salary_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data
}

export const addSalaryPayment = async (payment) => {
  const { data, error } = await supabase.from('salary_history').insert(payment).select().single()
  if (error) throw error
  return data
}

export const getAttendance = async (employeeId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2,'0')}-01`
  const endDate = `${year}-${String(month).padStart(2,'0')}-31`
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('date', startDate)
    .lte('date', endDate)
  if (error) throw error
  return data
}

export const markAttendance = async (record) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(record, { onConflict: 'employee_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}
