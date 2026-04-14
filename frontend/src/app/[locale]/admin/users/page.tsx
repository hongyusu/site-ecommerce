"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Search, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface UserItem {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  is_verified: boolean
  phone: string | null
  order_count: number
  created_at: string
  last_login: string | null
}

export default function AdminUsersPage() {
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") { router.push(`/${locale}`); return }
    fetchUsers()
  }, [isAuthenticated, user, page, search, locale, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "20" })
      if (search) params.set("search", search)
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.items)
      setTotalPages(data.pages)
      setTotal(data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleToggle = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`)
      await fetchUsers()
    } catch { /* ignore */ }
  }

  if (!isAuthenticated || user?.role !== "admin") return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link href={`/${locale}/admin`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800"><Users className="w-6 h-6 inline mr-2" />User Management</h1>
          <p className="text-sm text-gray-500">{total} users</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-3 py-2 border rounded text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Orders</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Verified</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={`border-b last:border-0 hover:bg-gray-50 ${!u.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{u.order_count}</td>
                  <td className="px-4 py-3 text-center">
                    {u.is_verified ? <span className="text-green-600">✓</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(u.id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${u.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                      {u.is_active ? <><EyeOff className="w-3 h-3" /> Disable</> : <><Eye className="w-3 h-3" /> Enable</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${page === i + 1 ? "bg-primary-600 text-white" : "bg-white border hover:bg-gray-50"}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
