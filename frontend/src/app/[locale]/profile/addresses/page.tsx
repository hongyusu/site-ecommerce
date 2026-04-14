"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface Address {
  id: number
  full_name: string
  phone: string | null
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string
  country: string
  is_default_shipping: boolean
  is_default_billing: boolean
}

const EU_COUNTRIES = [
  "Finland", "Sweden", "Germany", "France", "Netherlands", "Belgium",
  "Austria", "Spain", "Italy", "Portugal", "Denmark", "Norway",
  "Poland", "Estonia", "Latvia", "Lithuania",
]

const emptyForm = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", postal_code: "", country: "Finland", is_default_shipping: false,
}

export default function AddressesPage() {
  const t = useTranslations("addresses")
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    fetchAddresses()
  }, [isAuthenticated, locale, router])

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/addresses")
      setAddresses(data)
    } catch {
      setError("Failed to load addresses")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")
    try {
      if (editingId) {
        await api.patch(`/addresses/${editingId}`, form)
      } else {
        await api.post("/addresses", form)
      }
      setMessage(t("saved"))
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await fetchAddresses()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Error saving address")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (addr: Address) => {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone || "",
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default_shipping: addr.is_default_shipping,
    })
    setEditingId(addr.id)
    setShowForm(true)
    setMessage("")
    setError("")
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("deleteConfirm"))) return
    try {
      await api.delete(`/addresses/${id}`)
      setMessage(t("deleted"))
      await fetchAddresses()
    } catch {
      setError("Failed to delete address")
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/profile`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
        {!showForm && (
          <button
            onClick={() => {
              setForm(emptyForm)
              setEditingId(null)
              setShowForm(true)
              setMessage("")
              setError("")
            }}
            className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded hover:bg-accent-600 font-medium"
          >
            <Plus className="w-4 h-4" /> {t("addNew")}
          </button>
        )}
      </div>

      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("addressLine1")} *
              </label>
              <input
                type="text"
                value={form.address_line1}
                onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("addressLine2")}
              </label>
              <input
                type="text"
                value={form.address_line2}
                onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("city")} *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("postalCode")} *
                </label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("country")} *
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EU_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_default_shipping}
                onChange={(e) =>
                  setForm({ ...form, is_default_shipping: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{t("defaultShipping")}</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {saving ? "..." : t("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm(emptyForm)
                }}
                className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-lg shadow-sm border p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{addr.full_name}</h3>
                <div className="flex gap-2">
                  {addr.is_default_shipping && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{addr.address_line1}</p>
              {addr.address_line2 && (
                <p className="text-sm text-gray-600">{addr.address_line2}</p>
              )}
              <p className="text-sm text-gray-600">
                {addr.postal_code} {addr.city}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>
              {addr.phone && (
                <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
              )}
              <div className="flex gap-3 mt-3 pt-3 border-t">
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
                >
                  <Pencil className="w-3.5 h-3.5" /> {t("edit")}
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
