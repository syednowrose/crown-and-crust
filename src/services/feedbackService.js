import { supabase } from './supabaseClient'

export const getFeedback = async ({ foodId, orderId } = {}) => {
  let query = supabase
    .from('feedback')
    .select(`*, customers(name), foods(name), orders(id)`)
    .order('created_at', { ascending: false })
  if (foodId) query = query.eq('food_id', foodId)
  if (orderId) query = query.eq('order_id', orderId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const submitFeedback = async (fb) => {
  const { data, error } = await supabase.from('feedback').insert(fb).select().single()
  if (error) throw error
  return data
}

export const flagFeedback = async (id, isFlagged) => {
  const { data, error } = await supabase
    .from('feedback')
    .update({ is_flagged: isFlagged })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getAverageRating = async (foodId) => {
  const { data, error } = await supabase
    .from('feedback')
    .select('rating')
    .eq('food_id', foodId)
  if (error) throw error
  if (!data.length) return 0
  return data.reduce((s, f) => s + f.rating, 0) / data.length
}

export const getTopFeedback = async (limit = 6) => {
  const { data, error } = await supabase
    .from('feedback')
    .select(`*, customers(name), foods(name, image_url)`)
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
