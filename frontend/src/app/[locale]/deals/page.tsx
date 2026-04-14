"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Flame, Star, Tag } from "lucide-react"
import { api } from "@/lib/api"

interface Product {
  id: number
  name: string
  slug: string
  short_description: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  rating_average: number
  rating_count: number
  images: { image_url: string; is_primary: boolean }[]
}

export default function DealsPage() {
  const locale = useLocale()
  const t = useTranslations()
  const [deals, setDeals] = useState<Product[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dealsRes, featuredRes] = await Promise.all([
          api.get("/products", { params: { is_deal: true, page_size: 20 } }),
          api.get("/products", { params: { is_featured: true, page_size: 20 } }),
        ])
        setDeals(dealsRes.data.items)
        setFeatured(featuredRes.data.items)
      } catch {
        // ignore
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const getImage = (p: Product) => {
    const primary = p.images.find((i) => i.is_primary)
    return primary?.image_url || p.images[0]?.image_url || "https://placehold.co/300x300?text=No+Image"
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const price = Number(product.price)
    const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null
    const discount = comparePrice && comparePrice > price
      ? Math.round((1 - price / comparePrice) * 100)
      : null

    return (
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="group bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden"
      >
        <div className="relative aspect-square bg-gray-50">
          <img src={getImage(product)} alt={product.name} className="w-full h-full object-cover" />
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.stock_quantity < 5 && product.stock_quantity > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 group-hover:text-accent-500 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.short_description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">&euro;{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price && (
              <span className="text-sm text-gray-400 line-through">&euro;{comparePrice.toFixed(2)}</span>
            )}
          </div>
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {Number(product.rating_average).toFixed(1)} ({product.rating_count})
              </span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">Deals & Offers</h1>
            <span className="text-sm text-gray-500 ml-2">{deals.length} products on sale</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Featured Section */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6 text-accent-500" />
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <span className="text-sm text-gray-500 ml-2">{featured.length} featured</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {deals.length === 0 && featured.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No deals or featured products at the moment.</p>
        </div>
      )}
    </div>
  )
}
