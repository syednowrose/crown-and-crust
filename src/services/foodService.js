import { supabase } from './supabaseClient'

export const getFoods = async ({ category, search } = {}) => {
  let query = supabase.from('foods').select(`*, employees(name)`)
  if (category && category !== 'All') query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getFoodById = async (id) => {
  const { data, error } = await supabase
    .from('foods')
    .select(`*, employees(name)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createFood = async (food) => {
  const { data, error } = await supabase.from('foods').insert(food).select().single()
  if (error) throw error
  return data
}

export const updateFood = async (id, updates) => {
  const { data, error } = await supabase.from('foods').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteFood = async (id) => {
  const { error } = await supabase.from('foods').delete().eq('id', id)
  if (error) throw error
}

export const uploadFoodImage = async (file, foodId) => {
  const ext = file.name.split('.').pop()
  const path = `food-images/${foodId}.${ext}`
  const { error } = await supabase.storage.from('food-images').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('food-images').getPublicUrl(path)
  return data.publicUrl
}

export const getFeaturedFoods = async () => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('is_featured', true)
    .limit(6)
  if (error) throw error
  return data
}
