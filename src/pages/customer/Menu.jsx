import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Info } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFoods } from '../../services/foodService'
import useCartStore from '../../store/useCartStore'
import CustomerLayout from '../../components/layout/CustomerLayout'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Cakes', 'Pastries', 'Breads', 'Desserts', 'Beverages', 'Savoury']

export default function CustomerMenu() {
  const addItem = useCartStore(s => s.addItem)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['foods', selectedCategory, searchTerm],
    queryFn: () => getFoods({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: searchTerm || undefined
    })
  })

  const handleAddToCart = (item) => {
    if (item.stock_status === 'out_of_stock') {
      toast.error('This item is currently out of stock')
      return
    }
    addItem(item)
    toast.success(`${item.name} added to cart!`, { icon: '🥐' })
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sandalwood-500 text-sm tracking-wider uppercase mb-2">Artisanal Selection</p>
          <h1 className="font-serif text-4xl md:text-5xl text-espresso-800">Our Menu</h1>
          <p className="text-sandalwood-600 max-w-md mx-auto mt-2">
            Freshly baked daily using the finest ingredients. Indulge in our exquisite collection.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 pb-6 border-b border-sandalwood-200">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-espresso-800 text-white'
                    : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
            <input
              type="text"
              placeholder="Search our bakery..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-full"
            />
          </div>
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-sandalwood-200 p-8">
            <Info size={40} className="text-sandalwood-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-espresso-800">No Items Found</h3>
            <p className="text-sandalwood-500 text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {foods.map((food) => (
                <motion.div
                  key={food.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(194,161,119,0.2)' }}
                  className="glass-card overflow-hidden group flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-sandalwood-100 overflow-hidden flex-shrink-0">
                    {food.image_url ? (
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-sandalwood-50">🥐</div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {food.stock_status === 'out_of_stock' && (
                        <span className="badge-danger">Out of Stock</span>
                      )}
                      {food.stock_status === 'limited' && (
                        <span className="badge-warning">Limited Qty</span>
                      )}
                      {food.stock_status === 'in_stock' && (
                        <span className="badge-success">In Stock</span>
                      )}
                    </div>
                    {food.is_featured && (
                      <span className="absolute top-3 left-3 badge-gold text-xs">⭐ Featured</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg text-espresso-800 group-hover:text-sandalwood-600 transition-colors">
                        {food.name}
                      </h3>
                      <span className="font-semibold text-espresso-700">₹{food.price}</span>
                    </div>
                    <p className="text-xs text-sandalwood-500 mb-2">{food.category}</p>
                    <p className="text-sm text-sandalwood-600 line-clamp-3 mb-4 flex-grow">
                      {food.description || 'No description available.'}
                    </p>

                    {food.prep_time && (
                      <p className="text-xs text-sandalwood-400 mb-3 flex items-center gap-1">
                        ⏱️ Prep: {food.prep_time} mins
                      </p>
                    )}

                    {/* Add to Cart button */}
                    <Button
                      variant="gold"
                      disabled={food.stock_status === 'out_of_stock'}
                      onClick={() => handleAddToCart(food)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      {food.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </CustomerLayout>
  )
}
