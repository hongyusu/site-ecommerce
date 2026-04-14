import { create } from "zustand"
import api from "@/lib/api"

interface WishlistItem {
  id: number
  product_id: number
  product_name: string
  product_slug: string
  product_price: number
  product_compare_at_price: number | null
  product_image_url: string | null
  product_stock: number
  product_is_active: boolean
  created_at: string
}

interface WishlistState {
  items: WishlistItem[]
  productIds: Set<number>
  loading: boolean
  fetchWishlist: () => Promise<void>
  addItem: (productId: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  resetWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  productIds: new Set<number>(),
  loading: false,

  fetchWishlist: async () => {
    try {
      set({ loading: true })
      const { data } = await api.get("/wishlist")
      const ids = new Set<number>(data.map((i: WishlistItem) => i.product_id))
      set({ items: data, productIds: ids, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addItem: async (productId) => {
    await api.post(`/wishlist/${productId}`)
    const ids = new Set(get().productIds)
    ids.add(productId)
    set({ productIds: ids })
    await get().fetchWishlist()
  },

  removeItem: async (productId) => {
    await api.delete(`/wishlist/${productId}`)
    const ids = new Set(get().productIds)
    ids.delete(productId)
    set({ productIds: ids })
    await get().fetchWishlist()
  },

  isInWishlist: (productId) => get().productIds.has(productId),

  resetWishlist: () => set({ items: [], productIds: new Set() }),
}))
