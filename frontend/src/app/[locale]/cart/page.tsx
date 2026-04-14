"use client"

import { useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"

export default function CartPage() {
  const t = useTranslations("cart")
  const locale = useLocale()
  const { items, itemCount, subtotal, loading, fetchCart, updateQuantity, removeItem } =
    useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <p className="text-gray-600 mb-4">{t("loginRequired")}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-block bg-accent-500 text-white px-6 py-2 rounded hover:bg-accent-600"
        >
          {t("loginButton")}
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("title")}</h1>
        <p className="text-gray-500 mb-6">{t("empty")}</p>
        <Link
          href={`/${locale}/products`}
          className="inline-block bg-accent-500 text-white px-6 py-3 rounded-lg hover:bg-accent-600 font-medium"
        >
          {t("continueShopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t("title")} ({itemCount})
      </h1>

      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-gray-50 text-sm font-medium text-gray-500">
          <div className="col-span-6">{t("product")}</div>
          <div className="col-span-2 text-center">{t("price")}</div>
          <div className="col-span-2 text-center">{t("quantity")}</div>
          <div className="col-span-2 text-right">{t("lineTotal")}</div>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b last:border-b-0 items-center"
          >
            {/* Product */}
            <div className="col-span-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.product_image_url ? (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <Link
                  href={`/${locale}/products/${item.product_slug}`}
                  className="font-medium text-gray-800 hover:text-accent-500"
                >
                  {item.product_name}
                </Link>
                {item.product_stock < 5 && item.product_stock > 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Only {item.product_stock} left
                  </p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2 text-center text-gray-700">
              &euro;{Number(item.product_price).toFixed(2)}
            </div>

            {/* Quantity */}
            <div className="col-span-2 flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() =>
                  item.quantity < item.product_stock &&
                  updateQuantity(item.id, item.quantity + 1)
                }
                disabled={item.quantity >= item.product_stock}
                className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total + Remove */}
            <div className="col-span-2 flex items-center justify-end gap-3">
              <span className="font-semibold text-gray-800">
                &euro;{(Number(item.product_price) * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 flex flex-col items-end">
        <div className="w-full md:w-80 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>{t("subtotal")}</span>
            <span>&euro;{Number(subtotal).toFixed(2)}</span>
          </div>
          <Link
            href={`/${locale}/checkout`}
            className="block w-full bg-accent-500 text-white text-center py-3 rounded-lg font-medium hover:bg-accent-600"
          >
            {t("proceedToCheckout")}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  )
}
