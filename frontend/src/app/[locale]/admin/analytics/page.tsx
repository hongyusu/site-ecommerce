"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, ShoppingCart, Users, Package, BarChart3 } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface Analytics {
  total_revenue: number
  revenue_30d: number
  revenue_7d: number
  total_orders: number
  orders_30d: number
  total_customers: number
  total_products: number
  avg_order_value: number
  top_products: { name: string; quantity: number; revenue: number }[]
  order_status_counts: Record<string, number>
}

export default function AdminAnalyticsPage() {
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") { router.push(`/${locale}`); return }
    const fetch = async () => {
      try { const { data } = await api.get("/admin/analytics"); setData(data) } catch { /* */ }
      setLoading(false)
    }
    fetch()
  }, [isAuthenticated, user, locale, router])

  if (!isAuthenticated || user?.role !== "admin") return null
  if (loading) return <div className="max-w-[1400px] mx-auto px-6 py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" /></div>
  if (!data) return <div className="max-w-[1400px] mx-auto px-6 py-8 text-gray-500">No data available</div>

  const statusColors: Record<string, string> = { confirmed: "bg-blue-500", processing: "bg-indigo-500", shipped: "bg-purple-500", delivered: "bg-green-500", cancelled: "bg-red-500", pending: "bg-yellow-500" }
  const totalStatusOrders = Object.values(data.order_status_counts).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link href={`/${locale}/admin`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6"><BarChart3 className="w-6 h-6 inline mr-2" />Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">&euro;{data.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-500" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Last 30d: &euro;{data.revenue_30d.toFixed(2)} · Last 7d: &euro;{data.revenue_7d.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{data.total_orders}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg"><ShoppingCart className="w-5 h-5 text-blue-500" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Last 30d: {data.orders_30d} · Avg: &euro;{data.avg_order_value.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold mt-1">{data.total_customers}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold mt-1">{data.total_products}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg"><Package className="w-5 h-5 text-amber-500" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Order Status Distribution</h2>
          <div className="space-y-3">
            {Object.entries(data.order_status_counts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24 capitalize">{status}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusColors[status] || "bg-gray-400"}`}
                    style={{ width: `${(count / totalStatusOrders) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Top Products by Sales</h2>
          {data.top_products.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.top_products.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="text-xs text-gray-400 mr-2">#{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">&euro;{p.revenue.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-2">({p.quantity} sold)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
