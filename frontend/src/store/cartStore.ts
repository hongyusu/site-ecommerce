import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/api"

interface CartItem {
  id: number
  product_id: number
  variant_id: number | null
  quantity: number
  product_name: string
  product_price: number
  product_image_url: string | null
  product_slug: string
  product_stock: number
}

interface CartState {
  items: CartItem[]
  itemCount: number
  subtotal: number
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number, variantId?: number | null) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  resetCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      loading: false,

      fetchCart: async () => {
        try {
          set({ loading: true })
          const { data } = await api.get("/cart")
          set({
            items: data.items,
            itemCount: data.item_count,
            subtotal: data.subtotal,
            loading: false,
          })
        } catch {
          set({ loading: false })
        }
      },

      addItem: async (productId, quantity = 1, variantId = null) => {
        const { data } = await api.post("/cart/items", {
          product_id: productId,
          variant_id: variantId,
          quantity,
        })
        set({
          items: data.items,
          itemCount: data.item_count,
          subtotal: data.subtotal,
        })
      },

      updateQuantity: async (itemId, quantity) => {
        const { data } = await api.patch(`/cart/items/${itemId}`, {
          quantity,
        })
        set({
          items: data.items,
          itemCount: data.item_count,
          subtotal: data.subtotal,
        })
      },

      removeItem: async (itemId) => {
        const { data } = await api.delete(`/cart/items/${itemId}`)
        set({
          items: data.items,
          itemCount: data.item_count,
          subtotal: data.subtotal,
        })
      },

      clearCart: async () => {
        await api.delete("/cart")
        set({ items: [], itemCount: 0, subtotal: 0 })
      },

      resetCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    {
      name: "cart-storage",
    }
  )
)
