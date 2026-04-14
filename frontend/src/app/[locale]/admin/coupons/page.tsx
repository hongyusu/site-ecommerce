"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface CouponItem {
  id: number
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  max_uses: number | null
  used_count: number
  min_purchase_amount: number | null
  valid_from: string
  valid_until: string | null
  is_active: boolean
}

const emptyForm = {
  code: "", description: "", discount_type: "percentage", discount_value: "",
  max_uses: "", min_purchase_amount: "", valid_from: "", valid_until: "", is_active: true,
}

export default function AdminCouponsPage() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    fetchCoupons()
  }, [isAuthenticated, user, locale, router])

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/coupons")
      setCoupons(data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        code: form.code,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        min_purchase_amount: form.min_purchase_amount ? parseFloat(form.min_purchase_amount) : null,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
      }

      if (editingId) {
        await api.patch(`/coupons/${editingId}`, body)
      } else {
        await api.post("/coupons", body)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await fetchCoupons()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Failed to save coupon")
    }
    setSaving(false)
  }

  const handleEdit = (c: CouponItem) => {
    setForm({
      code: c.code,
      description: c.description || "",
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      max_uses: c.max_uses ? String(c.max_uses) : "",
      min_purchase_amount: c.min_purchase_amount ? String(c.min_purchase_amount) : "",
      valid_from: c.valid_from ? c.valid_from.slice(0, 16) : "",
      valid_until: c.valid_until ? c.valid_until.slice(0, 16) : "",
      is_active: c.is_active,
    })
    setEditingId(c.id)
    setShowForm(true)
    setError("")
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this coupon?")) return
    try {
      await api.delete(`/coupons/${id}`)
      await fetchCoupons()
    } catch {
      // ignore
    }
  }

  const formatDiscount = (c: CouponItem) => {
    if (c.discount_type === "percentage") return `${c.discount_value}%`
    if (c.discount_type === "fixed_amount") return `€${Number(c.discount_value).toFixed(2)}`
    return "Free shipping"
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
        <h1 className="text-2xl font-bold text-gray-800">
          <Tag className="w-6 h-6 inline mr-2" />
          Coupon Management
        </h1>
        {!showForm && (
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError("") }}
            className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded hover:bg-accent-600 font-medium"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editingId ? "Edit Coupon" : "Create Coupon"}</h2>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  disabled={!!editingId}
                  placeholder="e.g. SAVE20"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. 20% off summer sale"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (€)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value {form.discount_type === "percentage" ? "(%)" : form.discount_type === "fixed_amount" ? "(€)" : ""}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  disabled={form.discount_type === "free_shipping"}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Purchase (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.min_purchase_amount}
                  onChange={(e) => setForm({ ...form, min_purchase_amount: e.target.value })}
                  placeholder="No minimum"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm">
                {saving ? "..." : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No coupons yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Discount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Min. Purchase</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Used</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Valid Until</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-gray-50 ${!c.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-primary-600">{c.code}</span>
                    {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatDiscount(c)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.min_purchase_amount ? `€${Number(c.min_purchase_amount).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "No expiry"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(c)} className="text-gray-500 hover:text-primary-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-gray-500 hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
