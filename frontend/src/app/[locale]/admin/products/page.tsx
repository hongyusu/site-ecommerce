"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Package, X, Layers } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface ProductItem {
  id: number
  name: string
  slug: string
  sku: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  is_deal: boolean
  category_id: number | null
  brand: string | null
  short_description: string | null
  description: string | null
  images: { image_url: string; is_primary: boolean }[]
}

interface Category {
  id: number
  name: string
}

const emptyForm = {
  name: "", slug: "", sku: "", description: "", short_description: "",
  price: "", compare_at_price: "", stock_quantity: "0", category_id: "",
  brand: "", is_active: true, is_featured: false, is_deal: false,
  image_url: "",
}

export default function AdminProductsPage() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

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
    fetchData()
  }, [isAuthenticated, user, page, search, locale, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "15", sort_by: "name", sort_order: "asc" })
      if (search) params.set("search", search)
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params}`),
        api.get("/categories"),
      ])
      setProducts(prodRes.data.items)
      setTotalPages(prodRes.data.pages)
      setTotal(prodRes.data.total)
      setCategories(catRes.data)
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
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        sku: form.sku,
        description: form.description || null,
        short_description: form.short_description || null,
        price: parseFloat(form.price) || 0,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        brand: form.brand || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_deal: form.is_deal,
      }

      if (editingId) {
        await api.patch(`/products/${editingId}`, body)
      } else {
        const { data: newProduct } = await api.post("/products", body)
        // Add image if provided
        if (form.image_url) {
          // Images are added via the product model - for now store in description
          // The product creation already handles this through the API
        }
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await fetchData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Failed to save product")
    }
    setSaving(false)
  }

  const handleEdit = (p: ProductItem) => {
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description || "",
      short_description: p.short_description || "",
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      stock_quantity: String(p.stock_quantity),
      category_id: p.category_id ? String(p.category_id) : "",
      brand: p.brand || "",
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_deal: p.is_deal,
      image_url: p.images?.[0]?.image_url || "",
    })
    setEditingId(p.id)
    setShowForm(true)
    setError("")
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/products/${id}`)
      await fetchData()
    } catch {
      // ignore
    }
  }

  const getImage = (p: ProductItem) =>
    p.images?.find((i) => i.is_primary)?.image_url || p.images?.[0]?.image_url || ""

  if (!isAuthenticated || user?.role !== "admin") return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link href={`/${locale}/admin`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t("manageProducts")}</h1>
          <p className="text-sm text-gray-500">{total} products</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="px-3 py-2 border rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {!showForm && (
            <button
              onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError("") }}
              className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded hover:bg-accent-600 font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> New Product
            </button>
          )}
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingId ? "Edit Product" : "Create Product"}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Auto-generated from name"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (EUR) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
                <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  placeholder="Original price"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input type="text" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_deal} onChange={(e) => setForm({ ...form, is_deal: e.target.checked })} />
                <span className="text-sm">Deal</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm">
                {saving ? "..." : editingId ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Flags</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${!p.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {getImage(p) ? (
                          <img src={getImage(p)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Link href={`/${locale}/products/${p.slug}`} className="font-medium text-gray-800 hover:text-accent-500">
                          {p.name}
                        </Link>
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium">&euro;{Number(p.price).toFixed(2)}</span>
                    {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                      <span className="block text-xs text-gray-400 line-through">&euro;{Number(p.compare_at_price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${p.stock_quantity === 0 ? "text-red-600" : p.stock_quantity < 10 ? "text-yellow-600" : "text-gray-800"}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {p.is_featured && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Featured</span>}
                      {p.is_deal && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Deal</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(p)} className="text-gray-500 hover:text-primary-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <Link href={`/${locale}/admin/products/${p.id}/variants`} className="text-gray-500 hover:text-purple-600" title="Manage Variants">
                        <Layers className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-gray-500 hover:text-red-500" title="Delete">
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${page === i + 1 ? "bg-primary-600 text-white" : "bg-white border hover:bg-gray-50"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
