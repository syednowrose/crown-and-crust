import { supabase } from './supabaseClient'

// ─── Income ──────────────────────────────────────────────────
export const getIncome = async ({ startDate, endDate } = {}) => {
  let query = supabase.from('income').select('*').order('date', { ascending: false })
  if (startDate) query = query.gte('date', startDate)
  if (endDate)   query = query.lte('date', endDate)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const addIncome = async (entry) => {
  const { data, error } = await supabase.from('income').insert(entry).select().single()
  if (error) throw error
  return data
}

export const updateIncome = async (id, updates) => {
  const { data, error } = await supabase.from('income').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteIncome = async (id) => {
  const { error } = await supabase.from('income').delete().eq('id', id)
  if (error) throw error
}

// ─── Expenses ────────────────────────────────────────────────
export const getExpenses = async ({ startDate, endDate } = {}) => {
  let query = supabase.from('expenses').select('*').order('date', { ascending: false })
  if (startDate) query = query.gte('date', startDate)
  if (endDate)   query = query.lte('date', endDate)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const addExpense = async (entry) => {
  const { data, error } = await supabase.from('expenses').insert(entry).select().single()
  if (error) throw error
  return data
}

export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ─── Dashboard summary ────────────────────────────────────────
export const getFinanceSummary = async (period = 'monthly') => {
  const now = new Date()
  let startDate

  if (period === 'weekly') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    startDate = new Date(now.getFullYear(), 0, 1)
  }

  const start = startDate.toISOString().split('T')[0]
  const end = now.toISOString().split('T')[0]

  const [incomeData, expenseData] = await Promise.all([
    getIncome({ startDate: start, endDate: end }),
    getExpenses({ startDate: start, endDate: end }),
  ])

  const totalIncome  = incomeData.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = expenseData.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit    = totalIncome - totalExpense

  return { totalIncome, totalExpense, netProfit, incomeData, expenseData }
}

// ─── Monthly chart data (last 6 months) ──────────────────────
export const getMonthlyChartData = async () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0],
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0],
    })
  }

  const results = await Promise.all(
    months.map(async (m) => {
      const [inc, exp] = await Promise.all([
        getIncome({ startDate: m.start, endDate: m.end }),
        getExpenses({ startDate: m.start, endDate: m.end }),
      ])
      const income  = inc.reduce((s, i) => s + Number(i.amount), 0)
      const expense = exp.reduce((s, e) => s + Number(e.amount), 0)
      return { month: m.month, income, expense, profit: income - expense }
    })
  )
  return results
}
