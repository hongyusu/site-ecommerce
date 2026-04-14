"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface OrderSummary {
  id: number
  order_number: string
  status: string
  total: number
  created_at: string
  items: { product_name: string; quantity: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
}

export default function OrderHistoryPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    fetchOrders()
  }, [isAuthenticated, page, locale, router])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/orders?page=${page}&page_size=10`)
      setOrders(data.items)
      setTotalPages(data.pages)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/profile`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t("orders.backToProfile")}
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t("orders.title")}
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t("orders.noOrders")}</p>
          <Link
            href={`/${locale}/products`}
            className="inline-block mt-4 text-accent-500 hover:text-accent-600 font-medium"
          >
            {t("cart.continueShopping")}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-sm border p-5 hover:border-primary-300 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">
                      #{order.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="font-semibold">
                    &euro;{Number(order.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {order.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}
                  </span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded text-sm ${
                    page === i + 1
                      ? "bg-primary-600 text-white"
                      : "bg-white border text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
