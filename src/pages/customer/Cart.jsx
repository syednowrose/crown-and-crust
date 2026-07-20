import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import { useAuth } from '../../contexts/AuthContext'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import { useEffect } from 'react'

export default function CustomerCart() {
  const { user, customerProfile } = useAuth()
  const navigate = useNavigate()
  
  const {
    items,
    updateQuantity,
    removeItem,
    deliveryAddress,
    setDeliveryAddress,
    subtotal,
    deliveryCharge,
    total
  } = useCartStore()

  // Initialize address from customer profile if available
  useEffect(() => {
    if (customerProfile?.address && !deliveryAddress) {
      setDeliveryAddress(customerProfile.address)
    }
  }, [customerProfile, deliveryAddress, setDeliveryAddress])

  const handleCheckout = () => {
    if (!user) {
      navigate('/customer/login')
      return
    }
    navigate('/customer/checkout')
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl md:text-4xl text-espresso-800 mb-8 text-center">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm border border-sandalwood-200 rounded-2xl p-8">
            <ShoppingBag size={48} className="text-sandalwood-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl text-espresso-800 mb-2">Your cart is empty</h2>
            <p className="text-sandalwood-500 mb-6">Explore our menu and add some sweet delights!</p>
            <Link to="/customer/menu">
              <Button variant="gold">View Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-card p-4 flex gap-4 items-center"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-sandalwood-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🥐</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <h3 className="font-serif text-base text-espresso-800">{item.name}</h3>
                    <p className="text-xs text-sandalwood-500 mb-1">{item.category}</p>
                    <p className="text-sm font-semibold text-espresso-700">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg bg-sandalwood-100 hover:bg-sandalwood-200 text-espresso-700 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-espresso-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg bg-sandalwood-100 hover:bg-sandalwood-200 text-espresso-700 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Summary & Address */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <div className="glass-card p-6">
                <h3 className="font-serif text-lg text-espresso-800 mb-3">Delivery Location</h3>
                <textarea
                  placeholder="Enter your full delivery address..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="input-field text-sm resize-none"
                />
              </div>

              {/* Order Summary */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-serif text-lg text-espresso-800 pb-2 border-b border-sandalwood-100">
                  Summary
                </h3>
                <div className="flex justify-between text-sm text-espresso-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-espresso-700">
                  <span>Delivery Charge</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-serif text-base text-espresso-800 font-semibold pt-2 border-t border-sandalwood-100">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={!deliveryAddress.trim()}
                  variant="gold"
                  className="w-full flex items-center justify-center gap-2 mt-4"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
                {!deliveryAddress.trim() && (
                  <p className="text-xs text-center text-red-500 mt-1">Please specify a delivery address.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
