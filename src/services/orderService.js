import { supabase } from './supabaseClient'

export const getOrders = async ({ status, customerId } = {}) => {
  let query = supabase
    .from('orders')
    .select(`*, customers(name, email, phone), employees(name)`)
    .order('order_date', { ascending: false })
  if (status) query = query.eq('status', status)
  if (customerId) query = query.eq('customer_id', customerId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, customers(name, email, phone, address), employees(name, phone)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createOrder = async (order) => {
  const { data, error } = await supabase.from('orders').insert(order).select().single()
  if (error) throw error
  return data
}

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const assignDeliveryPartner = async (orderId, partnerId) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ delivery_partner_id: partnerId, status: 'out_for_delivery' })
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const markOrderPaid = async (id, paymentMethod) => {
  // NOTE: This is a mock payment status update only.
  // Real integration (Razorpay/Stripe) would update this via a secure webhook
  // after verifying actual transaction completion on their servers.
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', payment_method: paymentMethod })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getActiveOrdersCount = async () => {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['placed', 'preparing', 'out_for_delivery'])
  if (error) throw error
  return count || 0
}

export const subscribeToOrder = (orderId, callback) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`,
    }, callback)
    .subscribe()
}
