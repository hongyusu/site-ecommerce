"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { Clock, Star } from "lucide-react"

interface RecentProduct {
  id: number
  name: string
  slug: string
  price: number
  image_url: string | null
  rating_average: number
}

const STORAGE_KEY = "recently-viewed"
const MAX_ITEMS = 8

export function addToRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[]
    const filtered = stored.filter((p) => p.id !== product.id)
    filtered.unshift(product)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch {
    // ignore
  }
}

export default function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const locale = useLocale()
  const [products, setProducts] = useState<RecentProduct[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[]
      setProducts(excludeId ? stored.filter((p) => p.id !== excludeId) : stored)
    } catch {
      // ignore
    }
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
        <Clock className="w-5 h-5 text-gray-400" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={`/${locale}/products/${p.slug}`}
            className="group bg-white rounded-lg border hover:shadow-md transition overflow-hidden"
          >
            <div className="aspect-square bg-gray-50">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-800 group-hover:text-accent-500 line-clamp-2">{p.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-gray-900">&euro;{p.price.toFixed(2)}</span>
                {p.rating_average > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {Number(p.rating_average).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
