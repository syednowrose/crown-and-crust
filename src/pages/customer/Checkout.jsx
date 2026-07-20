import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import { useAuth } from '../../contexts/AuthContext'
import { createOrder } from '../../services/orderService'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function CustomerCheckout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, total, deliveryAddress, clearCart, deliveryCharge } = useCartStore()

  const [paymentMethod, setPaymentMethod] = useState('card') // card, upi, cod
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upiId, setUpiId] = useState('')
  const [step, setStep] = useState('form') // form, processing, success
  const [createdOrder, setCreatedOrder] = useState(null)

  const handleCardChange = (field, val) => {
    let formattedVal = val
    if (field === 'number') {
      formattedVal = val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19)
    } else if (field === 'expiry') {
      formattedVal = val.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().substring(0, 5)
      if (formattedVal.endsWith('/')) formattedVal = formattedVal.slice(0, -1)
    } else if (field === 'cvv') {
      formattedVal = val.replace(/\D/g, '').substring(0, 3)
    }
    setCardDetails(prev => ({ ...prev, [field]: formattedVal }))
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    // Simple mock validations
    if (paymentMethod === 'card') {
      if (cardDetails.number.length < 19 || !cardDetails.name || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3) {
        toast.error('Please enter valid card details.')
        return
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. user@okhdfc).')
        return
      }
    }

    setStep('processing')

    // Simulate "Processing Payment..." delay
    setTimeout(async () => {
      try {
        const orderData = {
          customer_id: user.id,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total_amount: total,
          delivery_charge: deliveryCharge,
          estimated_time: 45, // 45 minutes mock
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          status: 'placed',
          delivery_address: deliveryAddress,
        }

        const newOrder = await createOrder(orderData)
        setCreatedOrder(newOrder)
        clearCart()
        setStep('success')
        toast.success('Order placed successfully!', { icon: '🍰' })
      } catch (err) {
        toast.error(err.message || 'Failed to place order')
        setStep('form')
      }
    }, 2500)
  }

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <h1 className="font-serif text-3xl text-espresso-800 text-center">Secure Checkout</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Delivery details summary */}
                <div className="md:col-span-1 space-y-4">
                  <div className="glass-card p-5">
                    <h3 className="font-serif text-base text-espresso-800 mb-2">Delivery To</h3>
                    <p className="text-sm text-sandalwood-600 line-clamp-4">{deliveryAddress}</p>
                  </div>
                  
                  <div className="glass-card p-5">
                    <h3 className="font-serif text-base text-espresso-800 mb-2">Total Amount</h3>
                    <p className="font-serif text-2xl font-semibold text-espresso-800">₹{total}</p>
                    <p className="text-xs text-sandalwood-500 mt-1">Includes ₹{deliveryCharge} delivery charge</p>
                  </div>
                </div>

                {/* Payment form */}
                <div className="md:col-span-2">
                  <div className="glass-card p-6">
                    <h3 className="font-serif text-lg text-espresso-800 mb-4 pb-2 border-b border-sandalwood-100">
                      Payment Method
                    </h3>

                    <form onSubmit={handleSubmitOrder} className="space-y-5">
                      {/* Method selector */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'card', label: 'Card' },
                          { id: 'upi', label: 'UPI' },
                          { id: 'cod', label: 'Cash / COD' }
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                              paymentMethod === m.id
                                ? 'border-espresso-800 bg-espresso-800 text-white'
                                : 'border-sandalwood-200 text-espresso-700 hover:bg-sandalwood-50'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Card Details */}
                      {paymentMethod === 'card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 overflow-hidden pt-2"
                        >
                          <div>
                            <label className="form-label text-xs">Card Number</label>
                            <div className="relative">
                              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
                              <input
                                required
                                type="text"
                                placeholder="1234 5678 1234 5678"
                                value={cardDetails.number}
                                onChange={e => handleCardChange('number', e.target.value)}
                                className="input-field pl-9"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="form-label text-xs">Cardholder Name</label>
                            <input
                              required
                              type="text"
                              placeholder="Name on card"
                              value={cardDetails.name}
                              onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                              className="input-field"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="form-label text-xs">Expiry Date</label>
                              <input
                                required
                                type="text"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={e => handleCardChange('expiry', e.target.value)}
                                className="input-field text-center"
                              />
                            </div>
                            <div>
                              <label className="form-label text-xs">CVV</label>
                              <input
                                required
                                type="password"
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={e => handleCardChange('cvv', e.target.value)}
                                className="input-field text-center"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-sandalwood-400 italic">
                            * Note: This is a placeholder for future real gateway integration (e.g. Razorpay/Stripe). No real transaction occurs.
                          </p>
                        </motion.div>
                      )}

                      {/* UPI ID */}
                      {paymentMethod === 'upi' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 overflow-hidden pt-2"
                        >
                          <div>
                            <label className="form-label text-xs">UPI ID</label>
                            <input
                              required
                              type="text"
                              placeholder="username@bank"
                              value={upiId}
                              onChange={e => setUpiId(e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <p className="text-xs text-sandalwood-400 italic">
                            * Purely visual simulation. No real UPI request will be triggered.
                          </p>
                        </motion.div>
                      )}

                      {/* COD */}
                      {paymentMethod === 'cod' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pt-2 text-center text-sm text-sandalwood-600 bg-sandalwood-50 p-4 rounded-xl border border-sandalwood-100"
                        >
                          💸 Pay cash or card at the time of delivery. No advance payment required.
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        variant="gold"
                        className="w-full flex items-center justify-center gap-2 mt-4"
                      >
                        Place Order (₹{total}) <ArrowRight size={16} />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
              <h2 className="font-serif text-2xl text-espresso-800">Processing Payment...</h2>
              <p className="text-sandalwood-500 text-sm">Please do not refresh or close this tab.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card max-w-lg mx-auto p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-espresso-800">Payment Successful</h1>
                <p className="text-sandalwood-500 text-sm">Thank you for choosing Crown & Crust!</p>
              </div>

              {createdOrder && (
                <div className="bg-cream-100 border border-sandalwood-200 rounded-2xl p-4 text-left text-sm space-y-2 divide-y divide-sandalwood-100/50">
                  <div className="pb-2 flex justify-between">
                    <span className="text-sandalwood-500">Order ID:</span>
                    <span className="font-mono text-espresso-800 font-medium">#{createdOrder.id?.slice(0, 8)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-sandalwood-500">Total Paid:</span>
                    <span className="font-medium text-espresso-800">₹{createdOrder.total_amount}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-sandalwood-500">Est. Delivery Time:</span>
                    <span className="font-medium text-espresso-800">~{createdOrder.estimated_time} Mins</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-sandalwood-500">Delivery Address:</span>
                    <span className="text-espresso-700 text-right max-w-[200px] truncate">{createdOrder.delivery_address}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate('/customer/menu')}
                  variant="ghost"
                  className="flex-1"
                >
                  Order More
                </Button>
                <Button
                  onClick={() => navigate('/customer/orders')}
                  variant="gold"
                  className="flex-1"
                >
                  Track Order
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CustomerLayout>
  )
}
