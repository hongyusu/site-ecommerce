'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'

interface Product {
  id: number
  name: string
  slug: string
  short_description: string
  price: string | number
  compare_at_price: string | number | null
  stock_quantity: number
  is_featured: boolean
  is_deal: boolean
  images: Array<{ image_url: string; alt_text: string | null; is_primary: boolean }>
}

export default function ProductsPage() {
  const locale = useLocale()
  const t = useTranslations()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Get category and search from URL params
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined
  const search = searchParams.get('search') || ''

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1)
  }, [categoryId, search])

  useEffect(() => {
    fetchProducts()
  }, [page, search, categoryId, sortBy, sortOrder])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products', {
        params: {
          page,
          page_size: 20,
          search: search || undefined,
          category_id: categoryId || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      })
      setProducts(data.items)
      setTotalPages(data.pages)
    } catch (err: any) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const getPrimaryImage = (product: Product) => {
    const primaryImage = product.images.find((img) => img.is_primary)
    return primaryImage?.image_url || product.images[0]?.image_url || 'https://placehold.co/300x300?text=No+Image'
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          {search && (
            <p className="text-sm text-gray-600 mt-1">
              {t('products.searchResults')} <span className="font-medium">{search}</span>
            </p>
          )}
          {categoryId && (
            <p className="text-sm text-gray-600 mt-1">
              {t('products.filteredByCategory')}
            </p>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{t('products.sortBy')}</span>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':')
              setSortBy(sb)
              setSortOrder(so)
              setPage(1)
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="created_at:desc">{t('products.sortOptions.newest')}</option>
            <option value="price:asc">{t('products.sortOptions.priceLowToHigh')}</option>
            <option value="price:desc">{t('products.sortOptions.priceHighToLow')}</option>
            <option value="name:asc">{t('products.sortOptions.popular')}</option>
            <option value="rating_average:desc">Rating</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {t('products.failedToLoad')}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="mt-3 text-sm text-gray-600">{t('products.loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-base">{t('products.noProducts')}</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.slug}`}
                className="group bg-white rounded border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.is_deal && (
                    <span className="absolute top-2 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {t('products.deal')}
                    </span>
                  )}
                  {product.is_featured && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{t('products.outOfStock')}</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="text-xs font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-2 transition-colors min-h-[32px]">
                    {product.name}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {Number(product.price).toFixed(2)} €
                      </span>
                      {product.compare_at_price && (
                        <span className="text-xs text-gray-500 line-through">
                          {Number(product.compare_at_price).toFixed(2)} €
                        </span>
                      )}
                    </div>
                    {product.compare_at_price && (
                      <span className="text-xs text-accent-600 font-semibold">
                        {t('products.savePercent', {
                          percent: Math.round(
                            ((Number(product.compare_at_price) - Number(product.price)) /
                            Number(product.compare_at_price)) * 100
                          )
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('pagination.previous')}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm shadow-sm">
                <span>{page}</span>
                <span className="text-primary-200">/</span>
                <span>{totalPages}</span>
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 transition-all shadow-sm"
              >
                {t('pagination.next')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
