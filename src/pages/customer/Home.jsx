import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFoods, getFeaturedFoods } from '../../services/foodService'
import { getTopFeedback } from '../../services/feedbackService'
import useCartStore from '../../store/useCartStore'
import CustomerLayout from '../../components/layout/CustomerLayout'
import StarRating from '../../components/ui/StarRating'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const CATEGORIES = ['Cakes','Pastries','Breads','Desserts','Beverages']

export default function CustomerHome() {
  const addItem = useCartStore(s => s.addItem)
  const [reviewIdx, setReviewIdx] = useState(0)

  const { data: featured = [] } = useQuery({ queryKey: ['featured'], queryFn: getFeaturedFoods })
  const { data: topFeedback = [] } = useQuery({ queryKey: ['topFeedback'], queryFn: () => getTopFeedback(8) })

  // Auto-advance review carousel
  useEffect(() => {
    if (!topFeedback.length) return
    const t = setInterval(() => setReviewIdx(i => (i + 1) % topFeedback.length), 4000)
    return () => clearInterval(t)
  }, [topFeedback.length])

  const handleAddToCart = (food) => {
    addItem(food)
    toast.success(`${food.name} added to cart!`, { icon: '🥐' })
  }

  const stockBadgeColor = {
    in_stock: 'bg-emerald-500',
    limited: 'bg-amber-500',
    out_of_stock: 'bg-red-500',
  }

  return (
    <CustomerLayout>
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center bg-espresso-gradient overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-sandalwood-400 blur-3xl" />
          <div className="absolute bottom-20 right-40 w-96 h-96 rounded-full bg-gold-400 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sandalwood-400 text-sm tracking-widest uppercase mb-4 font-medium"
            >
              ✦ Artisanal Luxury Bakery
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-6xl md:text-7xl text-white leading-tight mb-6"
            >
              Crafted with<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sandalwood-300 to-gold-400">
                Love & Butter
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sandalwood-300 text-lg mb-10 leading-relaxed"
            >
              Premium artisanal bakes — from flaky croissants to decadent celebration cakes.
              Delivered fresh to your door.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/customer/menu">
                <Button variant="gold" size="lg" className="flex items-center gap-2">
                  Explore Menu <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/customer/orders">
                <Button variant="ghost" size="lg" className="border-sandalwood-400 text-sandalwood-200 hover:bg-white/10">
                  Track Order
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-8 mt-14"
            >
              {[
                { label:'Items', value: '50+' },
                { label:'Happy Customers', value: '2k+' },
                { label:'Years', value: '8+' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-serif text-3xl text-white font-semibold">{value}</p>
                  <p className="text-sandalwood-400 text-sm">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sandalwood-400"
        >
          <div className="w-6 h-10 rounded-full border-2 border-sandalwood-500 flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sandalwood-400" />
          </div>
        </motion.div>
      </section>

      {/* ─── Category Quick-links ───────────────────────── */}
      <section className="py-12 px-6 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat, i) => {
              const emoji = { Cakes:'🎂', Pastries:'🥐', Breads:'🍞', Desserts:'🍮', Beverages:'☕' }
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={`/customer/menu?category=${cat}`}
                    className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-sandalwood-200 hover:border-sandalwood-400 hover:shadow-card transition-all whitespace-nowrap group"
                  >
                    <span className="text-3xl">{emoji[cat]}</span>
                    <span className="text-sm font-medium text-espresso-700 group-hover:text-sandalwood-600 transition-colors">{cat}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Items ─────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sandalwood-500 text-sm tracking-wider uppercase mb-1">Handpicked for you</p>
              <h2 className="font-serif text-4xl text-espresso-800">Featured Items</h2>
            </div>
            <Link to="/customer/menu" className="flex items-center gap-1 text-sandalwood-600 hover:text-espresso-800 font-medium transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((food, i) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, boxShadow: '0 16px 48px rgba(194,161,119,0.3)' }}
                  className="glass-card overflow-hidden group cursor-default"
                >
                  <div className="relative h-56 bg-sandalwood-100 overflow-hidden">
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🥐</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-serif text-white text-lg font-semibold">{food.name}</p>
                      <p className="text-sandalwood-300 text-sm">{food.category}</p>
                    </div>
                    <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${stockBadgeColor[food.stock_status]}`} />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-2xl text-espresso-800 font-semibold">₹{food.price}</p>
                      <p className="text-xs text-sandalwood-400">⏱ {food.prep_time} min</p>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      disabled={food.stock_status === 'out_of_stock'}
                      onClick={() => handleAddToCart(food)}
                      className="flex items-center gap-1.5"
                    >
                      <ShoppingCart size={14} /> Add
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Why Us ─────────────────────────────────────── */}
      <section className="py-16 bg-sandalwood-gradient px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl text-espresso-800 text-center mb-12">The Crown & Crust Promise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🌾', title: 'Fresh Ingredients', desc: 'Sourced daily from trusted local farms and suppliers.' },
              { icon: '👨‍🍳', title: 'Master Bakers', desc: 'Crafted by our passionate team with years of expertise.' },
              { icon: '🚴', title: 'Fast Delivery', desc: 'Hot and fresh to your door within 45-60 minutes.' },
            ].map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-serif text-xl text-espresso-800 mb-2">{title}</h3>
                <p className="text-sandalwood-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews Carousel ───────────────────────────── */}
      {topFeedback.length > 0 && (
        <section className="py-16 px-6 bg-espresso-gradient">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sandalwood-400 text-sm tracking-wider uppercase mb-1">What customers say</p>
              <h2 className="font-serif text-4xl text-white">Loved by Many</h2>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {topFeedback[reviewIdx] && (
                  <motion.div
                    key={reviewIdx}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
                  >
                    <StarRating value={topFeedback[reviewIdx].rating} readOnly size={20} />
                    <p className="text-sandalwood-100 text-lg italic mt-4 mb-6 leading-relaxed">
                      "{topFeedback[reviewIdx].comment || 'Amazing experience!'}"
                    </p>
                    <p className="text-sandalwood-300 font-medium">{topFeedback[reviewIdx].customers?.name || 'Happy Customer'}</p>
                    {topFeedback[reviewIdx].foods?.name && (
                      <p className="text-sandalwood-400 text-sm mt-1">Re: {topFeedback[reviewIdx].foods.name}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav buttons */}
              <button onClick={() => setReviewIdx(i => (i - 1 + topFeedback.length) % topFeedback.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setReviewIdx(i => (i + 1) % topFeedback.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {topFeedback.map((_, i) => (
                <button key={i} onClick={() => setReviewIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === reviewIdx ? 'bg-gold-400 w-5' : 'bg-sandalwood-500'}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream-100 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl text-espresso-800 mb-4">Ready to indulge?</h2>
          <p className="text-sandalwood-500 mb-8">Browse our full menu and order your favourites.</p>
          <Link to="/customer/menu">
            <Button variant="primary" size="lg" className="px-10">Order Now</Button>
          </Link>
        </motion.div>
      </section>
    </CustomerLayout>
  )
}
