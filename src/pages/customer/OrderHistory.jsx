import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, subscribeToOrder } from '../../services/orderService'
import { submitFeedback } from '../../services/feedbackService'
import { useAuth } from '../../contexts/AuthContext'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StarRating from '../../components/ui/StarRating'
import { ShoppingBag, ChevronRight, CheckCircle2, Clock, Truck, Play, Star, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useEffect } from 'react'

const steps = [
  { status: 'placed', label: 'Placed', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
  { status: 'preparing', label: 'Preparing', icon: Clock, color: 'text-amber-500 bg-amber-50' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'text-purple-500 bg-purple-50' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' }
]

function OrderStepper({ status }) {
  const currentStepIndex = steps.findIndex(s => s.status === status)
  
  return (
    <div className="py-4">
      {status === 'cancelled' ? (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">This order was cancelled.</span>
        </div>
      ) : (
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-sandalwood-100 -translate-y-1/2 rounded-full z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gold-400 -translate-y-1/2 rounded-full z-0 transition-all duration-700" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          <div className="relative z-10 flex justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = idx <= currentStepIndex
              const isActive = idx === currentStepIndex

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1], boxShadow: '0 0 12px rgba(212,168,67,0.4)' } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                      isCompleted 
                        ? 'bg-gold-400 border-gold-400 text-white' 
                        : 'bg-white border-sandalwood-200 text-sandalwood-400'
                    }`}
                  >
                    <Icon size={16} />
                  </motion.div>
                  <span className={`text-[11px] mt-2 font-medium transition-colors ${
                    isCompleted ? 'text-espresso-800 font-semibold' : 'text-sandalwood-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CustomerOrders() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [feedbackOrder, setFeedbackOrder] = useState(null)
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: () => getOrders({ customerId: user.id }),
    enabled: !!user
  })

  // Set up real-time subscription for active orders to auto-update UI when status changes
  useEffect(() => {
    if (!orders.length) return
    
    const activeOrders = orders.filter(o => ['placed', 'preparing', 'out_for_delivery'].includes(o.status))
    const channels = activeOrders.map(order => {
      return subscribeToOrder(order.id, (payload) => {
        // Refetch or invalidate queries
        qc.invalidateQueries(['customer-orders', user?.id])
        toast(`Order status updated to: ${payload.new.status?.replace(/_/g, ' ')}`, { icon: '🛵' })
      })
    })

    return () => {
      channels.forEach(ch => ch.unsubscribe())
    }
  }, [orders, qc, user?.id])

  const handleOpenFeedback = (order) => {
    setFeedbackOrder(order)
    // Preselect the first food item from items list
    if (order.items && order.items.length > 0) {
      setSelectedFoodId(order.items[0].id || '')
    }
    setRating(5)
    setComment('')
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFoodId) {
      toast.error('Please select a food item to rate.')
      return
    }
    setSubmitting(true)
    try {
      await submitFeedback({
        order_id: feedbackOrder.id,
        food_id: selectedFoodId,
        customer_id: user.id,
        rating,
        comment
      })
      toast.success('Thank you for your feedback!', { icon: '⭐' })
      setFeedbackOrder(null)
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-espresso-800 mb-8 text-center">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm border border-sandalwood-200 rounded-2xl p-8">
            <ShoppingBag size={48} className="text-sandalwood-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl text-espresso-800 mb-2">No orders placed yet</h2>
            <p className="text-sandalwood-500 mb-6 font-sans">You haven't ordered anything yet. Let's change that!</p>
            <Button onClick={() => window.location.href = '/customer/menu'} variant="gold">
              Order Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderItems = Array.isArray(order.items) ? order.items : []
              return (
                <div key={order.id} className="glass-card p-6 space-y-4 border border-sandalwood-200 hover:border-sandalwood-300 transition-colors">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4 flex-wrap pb-3 border-b border-sandalwood-100">
                    <div>
                      <p className="text-xs text-sandalwood-500 font-sans">
                        Ordered on {format(new Date(order.order_date), 'dd MMM yyyy, hh:mm a')}
                      </p>
                      <p className="font-mono text-sm font-semibold text-espresso-800 mt-1">
                        Order ID: #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg font-bold text-espresso-800">₹{order.total_amount}</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status} ({order.payment_method?.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 py-1">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-espresso-700">
                          {item.name} <span className="text-sandalwood-500 font-medium">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-espresso-800">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Progress Stepper */}
                  <OrderStepper status={order.status} />

                  {/* Footer Actions */}
                  <div className="flex justify-between items-center gap-4 flex-wrap pt-3 border-t border-sandalwood-100">
                    <div className="text-xs text-sandalwood-500">
                      {order.status === 'delivered' ? (
                        <span className="text-emerald-600 font-medium">✓ Order Delivered</span>
                      ) : order.status === 'cancelled' ? (
                        <span className="text-red-500 font-medium">✗ Order Cancelled</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          ⏱️ Est. delivery time: {order.estimated_time || 45} mins
                        </span>
                      )}
                    </div>
                    {order.status === 'delivered' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenFeedback(order)}
                        className="flex items-center gap-1.5 border-sandalwood-300 text-sandalwood-700 hover:bg-sandalwood-100"
                      >
                        <Star size={14} className="fill-gold-400 text-gold-400" /> Write Review
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Feedback Modal */}
        <Modal
          isOpen={!!feedbackOrder}
          onClose={() => setFeedbackOrder(null)}
          title="Share Your Review"
        >
          {feedbackOrder && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="form-label text-sm">Which product are you reviewing?</label>
                <select
                  value={selectedFoodId}
                  onChange={e => setSelectedFoodId(e.target.value)}
                  className="input-field"
                >
                  {(feedbackOrder.items || []).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-sm">Rating</label>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>

              <div>
                <label className="form-label text-sm">Your Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked or how we can improve..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setFeedbackOrder(null)} className="flex-grow">
                  Cancel
                </Button>
                <Button type="submit" variant="gold" loading={submitting} className="flex-grow">
                  Submit Review
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </CustomerLayout>
  )
}
