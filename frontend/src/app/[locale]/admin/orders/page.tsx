"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface OrderRow {
  id: number
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  user_id: number
}

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

export default function AdminOrdersPage() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    fetchOrders()
  }, [isAuthenticated, user, page, filterStatus, locale, router])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "15" })
      if (filterStatus) params.set("order_status", filterStatus)
      const { data } = await api.get(`/orders/admin?${params}`)
      setOrders(data.items)
      setTotalPages(data.pages)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      await fetchOrders()
    } catch {
      // ignore
    }
  }

  const handleTrackingUpdate = async (orderId: number, trackingNumber: string, carrier: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { tracking_number: trackingNumber, carrier })
      await fetchOrders()
    } catch {
      // ignore
    }
  }

  if (!isAuthenticated || user?.role !== "admin") return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/admin`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("manageOrders")}</h1>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tracking</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/orders/${order.id}`} className="text-primary-600 hover:underline font-medium">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{order.payment_status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    &euro;{Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue={(order as any).tracking_number || ""}
                      placeholder="Tracking #"
                      className="text-xs border rounded px-2 py-1 w-28"
                      onBlur={(e) => {
                        if (e.target.value !== ((order as any).tracking_number || "")) {
                          handleTrackingUpdate(order.id, e.target.value, (order as any).carrier || "")
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${page === i + 1 ? "bg-primary-600 text-white" : "bg-white border hover:bg-gray-50"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
