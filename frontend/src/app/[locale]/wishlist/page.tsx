"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Trash2, ShoppingCart, Star } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { useCartStore } from "@/store/cartStore"

export default function WishlistPage() {
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { items, loading, fetchWishlist, removeItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    fetchWishlist()
  }, [isAuthenticated, locale, router, fetchWishlist])

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId)
    } catch {
      // ignore
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <Heart className="w-6 h-6 inline mr-2 text-red-500" />
        My Wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Link
            href={`/${locale}/products`}
            className="inline-block bg-accent-500 text-white px-6 py-2 rounded hover:bg-accent-600 font-medium"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => {
            const discount = item.product_compare_at_price && item.product_compare_at_price > item.product_price
              ? Math.round((1 - item.product_price / item.product_compare_at_price) * 100)
              : null

            return (
              <div key={item.id} className="bg-white rounded-lg border overflow-hidden group relative">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow hover:bg-red-50 transition"
                  title="Remove from wishlist"
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>

                <Link href={`/${locale}/products/${item.product_slug}`}>
                  <div className="relative aspect-square bg-gray-50">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-accent-500 line-clamp-2">
                      {item.product_name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">&euro;{item.product_price.toFixed(2)}</span>
                      {item.product_compare_at_price && item.product_compare_at_price > item.product_price && (
                        <span className="text-sm text-gray-400 line-through">&euro;{item.product_compare_at_price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Add to cart */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => handleAddToCart(item.product_id)}
                    disabled={item.product_stock === 0}
                    className="w-full py-2 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {item.product_stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
