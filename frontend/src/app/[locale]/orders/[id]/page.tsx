"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { Package, ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface OrderItem {
  id: number
  product_name: string
  product_sku: string
  unit_price: number
  quantity: number
  total_price: number
}

interface OrderDetail {
  id: number
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  tax_amount: number
  shipping_cost: number
  discount_amount: number
  total: number
  currency: string
  payment_method: string | null
  shipping_name: string
  shipping_address_line1: string
  shipping_address_line2: string | null
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
  customer_notes: string | null
  items: OrderItem[]
  created_at: string
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

export default function OrderDetailPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${params.id}`)
        setOrder(data)
      } catch {
        setError("Order not found")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [isAuthenticated, params.id, locale, router])

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/profile/orders`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t("orders.backToOrders")}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <Package className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          {t("orders.order")} #{order.order_number}
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold mb-4">{t("orders.items")}</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">SKU: {item.product_sku} &middot; x{item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">&euro;{Number(item.total_price).toFixed(2)}</p>
                <p className="text-xs text-gray-500">&euro;{Number(item.unit_price).toFixed(2)} each</p>
              </div>
            </div>
          ))}

          {/* Price breakdown */}
          <div className="mt-4 pt-4 border-t space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("cart.subtotal")}</span>
              <span>&euro;{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("checkout.tax")} (24%)</span>
              <span>&euro;{Number(order.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("checkout.shipping")}</span>
              <span>{Number(order.shipping_cost) === 0 ? t("checkout.free") : `€${Number(order.shipping_cost).toFixed(2)}`}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t("checkout.discount")}</span>
                <span>-&euro;{Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>{t("cart.total")}</span>
              <span>&euro;{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-2">{t("checkout.shippingAddress")}</h3>
            <div className="text-sm text-gray-600">
              <p>{order.shipping_name}</p>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>{order.shipping_postal_code} {order.shipping_city}</p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-2">{t("orders.details")}</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("orders.date")}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("orders.payment")}</span>
                <span>{order.payment_method || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("orders.paymentStatus")}</span>
                <span className="capitalize">{order.payment_status}</span>
              </div>
            </div>
          </div>

          {order.customer_notes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold mb-2">{t("checkout.notes")}</h3>
              <p className="text-sm text-gray-600">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
