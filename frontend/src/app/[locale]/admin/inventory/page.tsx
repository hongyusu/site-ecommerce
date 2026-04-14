"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Package, AlertTriangle, XCircle, Plus, Minus,
  Eye, EyeOff, Search, ChevronDown, RotateCcw, Pencil, Tag,
} from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface VariantInfo {
  id: number
  name: string
  sku: string
  stock_quantity: number
  price: number | null
}

interface InventoryItem {
  id: number
  name: string
  sku: string
  slug: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  is_featured: boolean
  category_id: number | null
  brand: string | null
  image_url: string | null
  updated_at: string
  variant_count: number
  variants: VariantInfo[]
}

interface Stats {
  total_products: number
  active_products: number
  inactive_products: number
  out_of_stock: number
  low_stock: number
  total_stock_value: number
}

export default function InventoryPage() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("stock_quantity")
  const [sortOrder, setSortOrder] = useState("asc")

  // Adjustment modal
  const [adjustProduct, setAdjustProduct] = useState<InventoryItem | null>(null)
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState("")

  // Pricing modal
  const [pricingProduct, setPricingProduct] = useState<InventoryItem | null>(null)
  const [priceValue, setPriceValue] = useState("")
  const [compareValue, setCompareValue] = useState("")
  const [pricingError, setPricingError] = useState("")
  const [savingPrice, setSavingPrice] = useState(false)

  // Threshold edit
  const [editThresholdId, setEditThresholdId] = useState<number | null>(null)
  const [thresholdValue, setThresholdValue] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    fetchData()
  }, [isAuthenticated, user, page, search, stockFilter, activeFilter, sortBy, sortOrder, locale, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "15",
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      if (search) params.set("search", search)
      if (stockFilter !== "all") params.set("stock_status", stockFilter)
      if (activeFilter !== "all") params.set("active_status", activeFilter)

      const [invResp, statsResp] = await Promise.all([
        api.get(`/inventory?${params}`),
        api.get("/inventory/stats"),
      ])
      setItems(invResp.data.items)
      setTotalPages(invResp.data.pages)
      setTotal(invResp.data.total)
      setStats(statsResp.data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const handleAdjustStock = async () => {
    if (!adjustProduct || !adjustQty) return
    setAdjusting(true)
    setAdjustError("")
    try {
      await api.patch(`/inventory/${adjustProduct.id}/stock`, {
        quantity: parseInt(adjustQty),
        reason: adjustReason || null,
      })
      setAdjustProduct(null)
      setAdjustQty("")
      setAdjustReason("")
      await fetchData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setAdjustError(e.response?.data?.detail || "Failed to adjust stock")
    }
    setAdjusting(false)
  }

  const handleToggleActive = async (productId: number) => {
    try {
      await api.patch(`/inventory/${productId}/toggle-active`)
      await fetchData()
    } catch {
      // ignore
    }
  }

  const handleSavePricing = async () => {
    if (!pricingProduct) return
    setSavingPrice(true)
    setPricingError("")
    try {
      const body: Record<string, number | null> = {}
      if (priceValue !== "") body.price = parseFloat(priceValue)
      if (compareValue !== "") body.compare_at_price = parseFloat(compareValue) || 0
      else body.compare_at_price = 0
      await api.patch(`/inventory/${pricingProduct.id}/pricing`, body)
      setPricingProduct(null)
      await fetchData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setPricingError(e.response?.data?.detail || "Failed to update pricing")
    }
    setSavingPrice(false)
  }

  const handleUpdateThreshold = async (productId: number) => {
    if (!thresholdValue) return
    try {
      await api.patch(`/inventory/${productId}/threshold?threshold=${thresholdValue}`)
      setEditThresholdId(null)
      setThresholdValue("")
      await fetchData()
    } catch {
      // ignore
    }
  }

  const getStockBadge = (item: InventoryItem) => {
    if (item.stock_quantity === 0) {
      return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Out of stock</span>
    }
    if (item.stock_quantity <= item.low_stock_threshold) {
      return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3" /> Low stock</span>
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">In stock</span>
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

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <Package className="w-6 h-6 inline mr-2" />
        Inventory Management
      </h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total_products}</p>
            <p className="text-xs text-gray-500">Total Products</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active_products}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{stats.inactive_products}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.low_stock}</p>
            <p className="text-xs text-gray-500">Low Stock</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.out_of_stock}</p>
            <p className="text-xs text-gray-500">Out of Stock</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-xl font-bold text-primary-600">&euro;{stats.total_stock_value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Stock Value</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(":")
              setSortBy(sb)
              setSortOrder(so)
              setPage(1)
            }}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="stock_quantity:asc">Stock: Low to High</option>
            <option value="stock_quantity:desc">Stock: High to Low</option>
            <option value="name:asc">Name: A-Z</option>
            <option value="name:desc">Name: Z-A</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="updated_at:desc">Recently Updated</option>
          </select>

          <button
            onClick={() => { setSearch(""); setStockFilter("all"); setActiveFilter("all"); setSortBy("stock_quantity"); setSortOrder("asc"); setPage(1) }}
            className="p-2 border rounded text-gray-500 hover:bg-gray-50"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">{total} products found</p>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 text-center font-medium text-gray-500">Threshold</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Visibility</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 hover:bg-gray-50 ${
                    !item.is_active ? "opacity-60 bg-gray-50" : ""
                  } ${item.stock_quantity === 0 ? "bg-red-50/50" : ""}`}
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/${locale}/products/${item.slug}`}
                          className="font-medium text-gray-800 hover:text-accent-500"
                        >
                          {item.name}
                        </Link>
                        {item.brand && (
                          <p className="text-xs text-gray-400">{item.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.sku}</td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setPricingProduct(item)
                        setPriceValue(String(item.price))
                        setCompareValue(item.compare_at_price ? String(item.compare_at_price) : "")
                        setPricingError("")
                      }}
                      className="group text-right text-gray-800 hover:text-accent-500 transition"
                      title="Click to edit pricing"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <div>
                          <span className="font-medium">&euro;{item.price.toFixed(2)}</span>
                          {item.compare_at_price && item.compare_at_price > item.price && (
                            <div className="text-xs">
                              <span className="line-through text-gray-400">&euro;{item.compare_at_price.toFixed(2)}</span>
                              <span className="ml-1 text-green-600 font-medium">
                                -{Math.round((1 - item.price / item.compare_at_price) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <Pencil className="w-3 h-3 text-gray-300 group-hover:text-accent-500" />
                      </div>
                    </button>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-lg font-bold ${
                      item.stock_quantity === 0
                        ? "text-red-600"
                        : item.stock_quantity <= item.low_stock_threshold
                          ? "text-yellow-600"
                          : "text-gray-800"
                    }`}>
                      {item.stock_quantity}
                    </span>
                    {item.variant_count > 0 && (
                      <Link
                        href={`/${locale}/admin/products/${item.id}/variants`}
                        className="block text-xs text-purple-600 hover:text-purple-800 mt-0.5"
                        title="Manage variants"
                      >
                        {item.variant_count} variants
                      </Link>
                    )}
                  </td>

                  {/* Threshold */}
                  <td className="px-4 py-3 text-center">
                    {editThresholdId === item.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          value={thresholdValue}
                          onChange={(e) => setThresholdValue(e.target.value)}
                          className="w-16 px-1 py-0.5 border rounded text-center text-xs"
                          min={0}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateThreshold(item.id)
                            if (e.key === "Escape") setEditThresholdId(null)
                          }}
                        />
                        <button
                          onClick={() => handleUpdateThreshold(item.id)}
                          className="text-green-600 text-xs"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditThresholdId(item.id); setThresholdValue(String(item.low_stock_threshold)) }}
                        className="text-gray-400 hover:text-gray-700 text-xs"
                        title="Click to edit threshold"
                      >
                        {item.low_stock_threshold}
                      </button>
                    )}
                  </td>

                  {/* Stock Status Badge */}
                  <td className="px-4 py-3 text-center">
                    {getStockBadge(item)}
                  </td>

                  {/* Active/Inactive Toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        item.is_active
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title={item.is_active ? "Click to disable" : "Click to enable"}
                    >
                      {item.is_active ? (
                        <><Eye className="w-3 h-3" /> Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Disabled</>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setAdjustProduct(item); setAdjustQty(""); setAdjustReason(""); setAdjustError("") }}
                        className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded hover:bg-primary-100"
                        title="Adjust stock"
                      >
                        <Plus className="w-3 h-3" /><Minus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${
                page === i + 1 ? "bg-primary-600 text-white" : "bg-white border hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-1">Adjust Stock</h3>
            <p className="text-sm text-gray-500 mb-2">
              {adjustProduct.name} — Product stock: <strong>{adjustProduct.stock_quantity}</strong> units
            </p>
            {adjustProduct.variant_count > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                <p className="text-xs font-medium text-purple-700 mb-1.5">
                  This product has {adjustProduct.variant_count} variants with separate stock:
                </p>
                <div className="space-y-1">
                  {adjustProduct.variants.map((v) => (
                    <div key={v.id} className="flex justify-between text-xs text-purple-600">
                      <span>{v.name} ({v.sku})</span>
                      <span className="font-medium">{v.stock_quantity} units</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/${locale}/admin/products/${adjustProduct.id}/variants`}
                  className="inline-block text-xs text-purple-700 font-medium mt-2 hover:underline"
                  onClick={() => setAdjustProduct(null)}
                >
                  Manage variant stock →
                </Link>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (+/-)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustQty(String(Math.abs(parseInt(adjustQty) || 0)))}
                    className={`px-3 py-2 border rounded text-sm font-medium ${
                      !adjustQty || parseInt(adjustQty) >= 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAdjustQty(String(-Math.abs(parseInt(adjustQty) || 0)))}
                    className={`px-3 py-2 border rounded text-sm font-medium ${
                      adjustQty && parseInt(adjustQty) < 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="e.g. 10 or -5"
                    className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>
                {adjustQty && (
                  <p className="text-xs mt-1 text-gray-500">
                    New stock: <strong>{Math.max(0, adjustProduct.stock_quantity + (parseInt(adjustQty) || 0))}</strong> units
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Restocked from supplier, Damaged goods"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {adjustError && (
                <p className="text-sm text-red-600">{adjustError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAdjustStock}
                  disabled={!adjustQty || adjusting}
                  className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
                >
                  {adjusting ? "..." : "Apply Adjustment"}
                </button>
                <button
                  onClick={() => setAdjustProduct(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {pricingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-semibold">Edit Pricing</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{pricingProduct.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (&euro;)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare-at Price (&euro;)
                  <span className="text-gray-400 font-normal ml-1">— original price to show discount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareValue}
                  onChange={(e) => setCompareValue(e.target.value)}
                  placeholder="Leave empty for no discount"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Preview */}
              {priceValue && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-500 mb-1">Customer will see:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">
                      &euro;{parseFloat(priceValue).toFixed(2)}
                    </span>
                    {compareValue && parseFloat(compareValue) > parseFloat(priceValue) && (
                      <>
                        <span className="line-through text-gray-400">
                          &euro;{parseFloat(compareValue).toFixed(2)}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          Save {Math.round((1 - parseFloat(priceValue) / parseFloat(compareValue)) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {pricingError && (
                <p className="text-sm text-red-600">{pricingError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePricing}
                  disabled={!priceValue || savingPrice}
                  className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
                >
                  {savingPrice ? "..." : "Save Pricing"}
                </button>
                <button
                  onClick={() => setPricingProduct(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
