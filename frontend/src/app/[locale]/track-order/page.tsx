"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import Link from "next/link"
import { Package, Search, CheckCircle, Truck, Clock, XCircle } from "lucide-react"
import api from "@/lib/api"

interface OrderResult {
  order_number: string
  status: string
  payment_status: string
  total: number
  tracking_number: string | null
  carrier: string | null
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
  items: { product_name: string; quantity: number; total_price: number }[]
}

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"]
const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  confirmed: CheckCircle, processing: Clock, shipped: Truck, delivered: Package,
}

export default function TrackOrderPage() {
  const locale = useLocale()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOrder(null)
    try {
      // Use the public products endpoint pattern — we need a public order lookup
      // For now, search through the API (this requires the backend endpoint)
      const { data } = await api.get(`/orders/track?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
      setOrder(data)
    } catch {
      setError("Order not found. Please check your order number and email.")
    }
    setLoading(false)
  }

  const getStepIndex = (status: string) => {
    const idx = STATUS_STEPS.indexOf(status)
    return idx >= 0 ? idx : -1
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        <Package className="w-6 h-6 inline mr-2" />Track Your Order
      </h1>
      <p className="text-gray-500 text-center mb-8">Enter your order number and email to check the status.</p>

      <form onSubmit={handleSearch} className="bg-white rounded-lg border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
            <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-123456-7890" required
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-2.5 rounded hover:bg-primary-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> {loading ? "Searching..." : "Track Order"}
        </button>
        {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
      </form>

      {order && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Order #{order.order_number}</h2>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className="text-lg font-bold">&euro;{Number(order.total).toFixed(2)}</span>
          </div>

          {/* Status Timeline */}
          {!["cancelled", "refunded"].includes(order.status) && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const currentIdx = getStepIndex(order.status)
                  const isComplete = i <= currentIdx
                  const isCurrent = i === currentIdx
                  const Icon = STATUS_ICONS[step] || CheckCircle
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${i <= currentIdx ? "bg-green-500" : "bg-gray-200"}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        isComplete ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-green-100" : ""}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs mt-2 capitalize ${isComplete ? "text-green-700 font-medium" : "text-gray-400"}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="flex items-center gap-2 mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
              <XCircle className="w-5 h-5" /> This order has been cancelled.
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">
                <Truck className="w-4 h-4 inline mr-1" />
                {order.carrier && <span>{order.carrier}: </span>}
                <span className="font-mono">{order.tracking_number}</span>
              </p>
            </div>
          )}

          {/* Items */}
          <h3 className="font-medium text-gray-800 mb-3">Items</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span className="text-gray-700">{item.product_name} x{item.quantity}</span>
              <span className="font-medium">&euro;{Number(item.total_price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-gray-400 mt-6">
        <Link href={`/${locale}`} className="hover:text-gray-600">Back to Store</Link>
      </p>
    </div>
  )
}
