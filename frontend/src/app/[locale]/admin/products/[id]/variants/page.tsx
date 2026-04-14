"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Package, X } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface Variant {
  id: number
  product_id: number
  sku: string
  name: string
  options: Record<string, string>
  price: number | null
  stock_quantity: number
  is_active: boolean
}

interface ProductInfo {
  id: number
  name: string
  price: number
  sku: string
}

const emptyForm = {
  sku: "", name: "", price: "", stock_quantity: "0", is_active: true,
  option_key: "size", option_value: "",
}

export default function VariantManagementPage() {
  const locale = useLocale()
  const router = useRouter()
  const params = useParams()
  const productId = params.id
  const { user, isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    fetchData()
  }, [isAuthenticated, user, productId, locale, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, varRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/variants`),
      ])
      setProduct({ id: prodRes.data.id, name: prodRes.data.name, price: Number(prodRes.data.price), sku: prodRes.data.sku })
      setVariants(varRes.data)
    } catch {
      setError("Failed to load product")
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const body: Record<string, unknown> = {
        sku: form.sku,
        name: form.name,
        options: { [form.option_key]: form.option_value },
        price: form.price ? parseFloat(form.price) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        is_active: form.is_active,
      }

      if (editingId) {
        await api.patch(`/products/${productId}/variants/${editingId}`, body)
        setMessage("Variant updated")
      } else {
        await api.post(`/products/${productId}/variants`, body)
        setMessage("Variant created")
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await fetchData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Failed to save variant")
    }
    setSaving(false)
  }

  const handleEdit = (v: Variant) => {
    const keys = Object.keys(v.options)
    setForm({
      sku: v.sku,
      name: v.name,
      price: v.price ? String(v.price) : "",
      stock_quantity: String(v.stock_quantity),
      is_active: v.is_active,
      option_key: keys[0] || "size",
      option_value: keys[0] ? v.options[keys[0]] : "",
    })
    setEditingId(v.id)
    setShowForm(true)
    setError("")
    setMessage("")
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete variant "${name}"?`)) return
    try {
      await api.delete(`/products/${productId}/variants/${id}`)
      setMessage("Variant deleted")
      await fetchData()
    } catch {
      setError("Failed to delete variant")
    }
  }

  if (!isAuthenticated || user?.role !== "admin") return null

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/admin/products`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Variants</h1>
          {product && (
            <p className="text-sm text-gray-500 mt-1">
              <Package className="w-4 h-4 inline mr-1" />
              {product.name} — Base price: &euro;{product.price.toFixed(2)} — SKU: {product.sku}
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setForm({ ...emptyForm, sku: `${product?.sku || "VAR"}-` })
              setEditingId(null)
              setShowForm(true)
              setError("")
              setMessage("")
            }}
            className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded hover:bg-accent-600 font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        )}
      </div>

      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Variant Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingId ? "Edit Variant" : "Add Variant"}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text" value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required disabled={!!editingId}
                  placeholder="e.g. SHOES-RUN-42"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required placeholder="e.g. Size 42, 512GB, Red"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Option Type</label>
                <select
                  value={form.option_key}
                  onChange={(e) => setForm({ ...form, option_key: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="size">Size</option>
                  <option value="color">Color</option>
                  <option value="storage">Storage</option>
                  <option value="ram">RAM</option>
                  <option value="material">Material</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Option Value *</label>
                <input
                  type="text" value={form.option_value}
                  onChange={(e) => setForm({ ...form, option_value: e.target.value })}
                  required placeholder="e.g. 42, 512GB, Red"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Override (&euro;)
                  <span className="text-gray-400 font-normal ml-1">— leave empty to use base price</span>
                </label>
                <input
                  type="number" step="0.01" min="0" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder={product ? `Base: €${product.price.toFixed(2)}` : ""}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number" min="0" value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox" checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm">
                {saving ? "..." : editingId ? "Update Variant" : "Create Variant"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }}
                className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Variant List */}
      {variants.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No variants yet. This product is sold as a single option.</p>
          <p className="text-xs mt-1">Add variants for sizes, colors, or storage options.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Variant</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Options</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className={`border-b last:border-0 hover:bg-gray-50 ${!v.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.sku}</td>
                  <td className="px-4 py-3">
                    {Object.entries(v.options).map(([k, val]) => (
                      <span key={k} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">
                        {k}: {val}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.price ? (
                      <span className="font-medium">&euro;{Number(v.price).toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Base price</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${v.stock_quantity === 0 ? "text-red-600" : v.stock_quantity < 5 ? "text-yellow-600" : "text-gray-800"}`}>
                      {v.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {v.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(v)} className="text-gray-500 hover:text-primary-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id, v.name)} className="text-gray-500 hover:text-red-500" title="Delete">
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
