'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProductSize {
  size: string
  quantity: number
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string | number
  name: string
  slug?: string
  category?: string | { name: string } | null
  categories?: ProductCategory[]
  sizes?: ProductSize[]
  price: number
  oldPrice?: number | null
  badge?: string | null
  colors?: string[]
  desc?: string
  description?: string
  image?: string
  images?: string[]
  active?: boolean
}

export interface CartItem {
  id: string | number
  name: string
  category: string
  price: number
  size: string
  color: string
  image?: string
  qty: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, size: string) => void
  removeItem: (index: number) => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        const existing = get().items.find(
          i => i.id === product.id && i.size === size
        )
        const categoryName = typeof product.category === 'string'
          ? product.category
          : (product.category as { name: string })?.name || ''

        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.id === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i
            )
          }))
        } else {
          set(state => ({
            items: [...state.items, {
              id: product.id,
              name: product.name,
              category: categoryName,
              price: product.price,
              size,
              color: product.colors?.[0] || '#E8DDD0',
              image: product.images?.[0] || product.image,
              qty: 1
            }]
          }))
        }
      },
      removeItem: (index) => {
        set(state => ({ items: state.items.filter((_, i) => i !== index) }))
      },
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'aura_cart' }
  )
)

interface UIStore {
  cartOpen: boolean
  modalProduct: Product | null
  toast: string | null
  setCartOpen: (v: boolean) => void
  openModal: (p: Product) => void
  closeModal: () => void
  showToast: (msg: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  modalProduct: null,
  toast: null,
  setCartOpen: (v) => set({ cartOpen: v }),
  openModal: (p) => set({ modalProduct: p }),
  closeModal: () => set({ modalProduct: null }),
  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 3000)
  }
}))