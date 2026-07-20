import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Image, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFoods, createFood, updateFood, deleteFood, uploadFoodImage } from '../../services/foodService'
import { getEmployees } from '../../services/employeeService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const CATEGORIES = ['All','Cakes','Pastries','Breads','Desserts','Beverages','Savoury']
const STOCK_STATUS = ['in_stock','out_of_stock','limited']

const stockBadge = {
  in_stock:    'badge-success',
  out_of_stock:'badge-danger',
  limited:     'badge-warning',
}
const stockLabel = { in_stock:'In Stock', out_of_stock:'Out of Stock', limited:'Limited' }

const defaultForm = { name:'', category:'Cakes', price:'', description:'', ingredients:'', prep_time:30, stock_status:'in_stock', quantity:0, made_by:'', is_featured:false }

export default function FoodManagement() {
  const qc = useQueryClient()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)   // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data: foods = [], isLoading } = useQuery({ queryKey: ['foods', category, search], queryFn: () => getFoods({ category, search }) })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })

  const deleteMutation = useMutation({
    mutationFn: deleteFood,
    onSuccess: () => { qc.invalidateQueries(['foods']); toast.success('Item deleted') },
    onError: (e) => toast.error(e.message),
  })

  const openAdd = () => {
    setForm(defaultForm); setImgFile(null); setImgPreview(null)
    setSelected(null); setModal('add')
  }

  const openEdit = (food) => {
    setForm({ ...food, made_by: food.made_by || '' })
    setImgPreview(food.image_url); setImgFile(null)
    setSelected(food); setModal('edit')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let image_url = form.image_url || null
      if (modal === 'add') {
        const newFood = await createFood({ ...form, price: Number(form.price), prep_time: Number(form.prep_time), quantity: Number(form.quantity), made_by: form.made_by || null })
        if (imgFile) image_url = await uploadFoodImage(imgFile, newFood.id)
        if (imgFile) await updateFood(newFood.id, { image_url })
        toast.success('Food item added!')
      } else {
        let updates = { ...form, price: Number(form.price), prep_time: Number(form.prep_time), quantity: Number(form.quantity), made_by: form.made_by || null }
        if (imgFile) image_url = await uploadFoodImage(imgFile, selected.id)
        await updateFood(selected.id, { ...updates, image_url })
        toast.success('Food item updated!')
      }
      qc.invalidateQueries(['foods'])
      setModal(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-800">Menu & Foods</h1>
          <p className="text-sandalwood-500 text-sm mt-0.5">Manage your bakery's menu items</p>
        </div>
        <Button onClick={openAdd} variant="primary" className="flex items-center gap-2">
          <Plus size={18} /> Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" className="input-field pl-9 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Food grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-sandalwood-300 mx-auto mb-3" />
          <p className="text-sandalwood-500">No items found. Add your first menu item!</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {foods.map((food, i) => (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(194,161,119,0.25)' }}
                className="glass-card overflow-hidden group cursor-default"
              >
                {/* Image */}
                <div className="relative h-44 bg-sandalwood-100 overflow-hidden">
                  {food.image_url ? (
                    <img src={food.image_url} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🥐</div>
                  )}
                  <span className={`absolute top-2 right-2 ${stockBadge[food.stock_status]} text-xs`}>
                    {stockLabel[food.stock_status]}
                  </span>
                  {food.is_featured && (
                    <span className="absolute top-2 left-2 badge-gold text-xs">⭐ Featured</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-espresso-800 text-sm leading-tight">{food.name}</h3>
                    <span className="text-sandalwood-600 font-semibold text-sm ml-2">₹{food.price}</span>
                  </div>
                  <p className="text-xs text-sandalwood-500 mb-1">{food.category}</p>
                  <p className="text-xs text-sandalwood-400 line-clamp-2">{food.description}</p>
                  {food.employees && <p className="text-xs text-sandalwood-400 mt-1">👨‍🍳 {food.employees.name}</p>}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(food)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-sandalwood-100 hover:bg-sandalwood-200 text-espresso-700 text-xs font-medium transition-colors">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => deleteMutation.mutate(food.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Menu Item' : 'Edit Menu Item'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="form-label">Photo</label>
            <div className="relative h-36 rounded-xl border-2 border-dashed border-sandalwood-200 bg-sandalwood-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-sandalwood-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              {imgPreview ? (
                <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-sandalwood-400">
                  <Image size={32} className="mx-auto mb-1" />
                  <p className="text-xs">Click to upload image</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Name *</label>
              <input required value={form.name} onChange={set('name')} className="input-field" placeholder="Croissant" />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select value={form.category} onChange={set('category')} className="input-field">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input-field" placeholder="150" />
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={set('quantity')} className="input-field" placeholder="10" />
            </div>
            <div>
              <label className="form-label">Prep Time (min)</label>
              <input type="number" min="1" value={form.prep_time} onChange={set('prep_time')} className="input-field" placeholder="30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Stock Status</label>
              <select value={form.stock_status} onChange={set('stock_status')} className="input-field">
                {STOCK_STATUS.map(s => <option key={s} value={s}>{stockLabel[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Made By (Baker)</label>
              <select value={form.made_by} onChange={set('made_by')} className="input-field">
                <option value="">— Select Baker —</option>
                {employees.filter(e => ['Baker','Manager','Admin'].includes(e.role)).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className="input-field resize-none" placeholder="A flaky, buttery croissant baked fresh every morning…" />
          </div>

          <div>
            <label className="form-label">Ingredients</label>
            <textarea value={form.ingredients} onChange={set('ingredients')} rows={2} className="input-field resize-none" placeholder="Flour, butter, eggs, sugar, milk…" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={set('is_featured')} className="w-4 h-4 rounded accent-sandalwood-500" />
            <label htmlFor="featured" className="text-sm text-espresso-700 cursor-pointer">Mark as Featured (shown on homepage)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              {modal === 'add' ? 'Add Item' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
