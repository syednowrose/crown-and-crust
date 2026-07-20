import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryAddress: '',
      deliveryCharge: 40,

      addItem: (food) => {
        const existing = get().items.find(i => i.id === food.id)
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          }))
        } else {
          set(state => ({ items: [...state.items, { ...food, quantity: 1 }] }))
        }
      },

      removeItem: (id) =>
        set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          set(state => ({ items: state.items.filter(i => i.id !== id) }))
        } else {
          set(state => ({
            items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i)
          }))
        }
      },

      clearCart: () => set({ items: [] }),

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      get totalItems()  { return get().items.reduce((s, i) => s + i.quantity, 0) },
      get subtotal()    { return get().items.reduce((s, i) => s + i.price * i.quantity, 0) },
      get total()       { return get().subtotal + get().deliveryCharge },
    }),
    {
      name: 'crown-crust-cart',
    }
  )
)

export default useCartStore
