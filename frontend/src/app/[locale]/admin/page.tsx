"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Package, ShoppingCart, BarChart3, Warehouse, MessageSquare, Tag, Users,
  ArrowRight, AlertTriangle, TrendingUp, CheckCircle,
} from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface RecentOrder {
  id: number
  order_number: string
  status: string
  total: number
  created_at: string
  items: { product_name: string; quantity: number }[]
}

interface InventoryStats {
  total_products: number
  active_products: number
  inactive_products: number
  out_of_stock: number
  low_stock: number
  total_stock_value: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminDashboard() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [invStats, setInvStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    const fetchAll = async () => {
      try {
        const [productsRes, ordersRes, invRes] = await Promise.all([
          api.get("/products?page_size=1"),
          api.get("/orders/admin?page_size=5"),
          api.get("/inventory/stats"),
        ])
        setTotalProducts(productsRes.data.total)
        setTotalOrders(ordersRes.data.total)
        setRecentOrders(ordersRes.data.items)
        setInvStats(invRes.data)
      } catch {
        // ignore
      }
      setLoading(false)
    }
    fetchAll()
  }, [isAuthenticated, user, locale, router])

  if (!isAuthenticated || user?.role !== "admin") return null

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  const totalRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t("dashboard")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your store performance and quick access to management tools.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalProducts}</p>
              <p className="text-xs text-gray-400 mt-1">
                {invStats ? `${invStats.active_products} active, ${invStats.inactive_products} disabled` : ""}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalOrders}</p>
              <p className="text-xs text-gray-400 mt-1">
                All time orders placed
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue (Recent)</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                &euro;{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                From last {recentOrders.length} orders
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Value</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                &euro;{invStats ? invStats.total_stock_value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total inventory value
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts + Quick Links row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inventory Alerts */}
        {invStats && (invStats.low_stock > 0 || invStats.out_of_stock > 0) && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <AlertTriangle className="w-5 h-5 inline mr-2 text-yellow-500" />
              Inventory Alerts
            </h2>
            <div className="space-y-3">
              {invStats.out_of_stock > 0 && (
                <div className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-red-800">Out of Stock</p>
                    <p className="text-sm text-red-600">
                      {invStats.out_of_stock} product{invStats.out_of_stock > 1 ? "s" : ""} with zero inventory
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/admin/inventory?stock_status=out_of_stock`}
                    className="text-sm text-red-700 font-medium hover:underline flex items-center gap-1"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
              {invStats.low_stock > 0 && (
                <div className="flex items-center justify-between bg-yellow-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-yellow-800">Low Stock Warning</p>
                    <p className="text-sm text-yellow-600">
                      {invStats.low_stock} product{invStats.low_stock > 1 ? "s" : ""} below reorder threshold
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/admin/inventory?stock_status=low_stock`}
                    className="text-sm text-yellow-700 font-medium hover:underline flex items-center gap-1"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <CheckCircle className="w-5 h-5 inline mr-2 text-primary-500" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              href={`/${locale}/admin/orders`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{t("manageOrders")}</p>
                  <p className="text-xs text-gray-500">View, filter, and update order statuses</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              href={`/${locale}/admin/inventory`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Warehouse className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{t("inventory")}</p>
                  <p className="text-xs text-gray-500">Adjust stock levels, enable/disable products</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              href={`/${locale}/admin/coupons`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Tag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Coupon Management</p>
                  <p className="text-xs text-gray-500">Create, edit, and manage discount codes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              href={`/${locale}/admin/users`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">User Management</p>
                  <p className="text-xs text-gray-500">View, search, and manage user accounts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              href={`/${locale}/admin/analytics`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Analytics</p>
                  <p className="text-xs text-gray-500">Revenue, top products, and order trends</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>

            <Link
              href={`/${locale}/admin/reviews`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Review Moderation</p>
                  <p className="text-xs text-gray-500">View, filter, and manage customer reviews</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          {totalOrders > 0 && (
            <Link
              href={`/${locale}/admin/orders`}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View all orders <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Order</th>
                  <th className="pb-2 font-medium text-gray-500">Date</th>
                  <th className="pb-2 font-medium text-gray-500">Items</th>
                  <th className="pb-2 font-medium text-gray-500">Status</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        href={`/${locale}/orders/${order.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-600 text-xs max-w-[200px] truncate">
                      {order.items?.map((i) => `${i.product_name} x${i.quantity}`).join(", ") || "-"}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">
                      &euro;{Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
