'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'
import PopularCategories from '@/components/PopularCategories'

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
  rating_average: string | number | null
  rating_count: number
  images: Array<{ image_url: string; alt_text: string | null; is_primary: boolean }>
}

export default function Home() {
  const locale = useLocale()
  const t = useTranslations()
  const [apiStatus, setApiStatus] = useState<string>('Checking...')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [dealProducts, setDealProducts] = useState<Product[]>([])

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'))

    // Fetch featured and deal products
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', {
        params: { page_size: 8 }
      })

      setFeaturedProducts(data.items.filter((p: Product) => p.is_featured).slice(0, 4))
      setDealProducts(data.items.filter((p: Product) => p.is_deal).slice(0, 4))
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const getPrimaryImage = (product: Product) => {
    const primaryImage = product.images.find((img) => img.is_primary)
    return primaryImage?.image_url || product.images[0]?.image_url || 'https://placehold.co/300x300?text=No+Image'
  }

  const renderStars = (rating: string | number | null, count: number) => {
    if (!rating || count === 0) return null
    const numRating = Number(rating)

    return (
      <div className="flex items-center gap-1 text-xs mb-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => {
            const fillPercentage = Math.min(Math.max(numRating - (star - 1), 0), 1) * 100
            return (
              <div key={star} className="relative w-3 h-3">
                <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
        <span className="text-gray-600">({count})</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">
              {t('home.hero.title')}
            </h1>
            <p className="text-sm text-primary-100 mb-5">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/products`}
                className="bg-white hover:bg-gray-100 text-primary-700 px-5 py-2 rounded text-sm font-semibold transition-colors"
              >
                {t('home.hero.browseProducts')}
              </Link>
              <Link
                href={`/${locale}/categories`}
                className="bg-primary-700 hover:bg-primary-800 text-white px-5 py-2 rounded text-sm font-semibold border-2 border-primary-500 transition-colors"
              >
                {t('home.hero.viewCategories')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Section */}
      {dealProducts.length > 0 && (
        <div className="bg-white py-6">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('home.deals.title')}</h2>
              <Link href={`/${locale}/products?deals=true`} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                {t('common.viewAll')} →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {dealProducts.map((product) => (
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
                    <span className="absolute top-2 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {t('products.deal')}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="text-xs font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1 transition-colors min-h-[32px]">
                      {product.name}
                    </h3>
                    {renderStars(product.rating_average, product.rating_count)}
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
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <PopularCategories />

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="bg-gray-50 py-6">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('home.featured.title')}</h2>
              <Link href={`/${locale}/products?featured=true`} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                {t('common.viewAll')} →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {featuredProducts.map((product) => (
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
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-xs font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1 transition-colors min-h-[32px]">
                      {product.name}
                    </h3>
                    {renderStars(product.rating_average, product.rating_count)}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {Number(product.price).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges / Info Section */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('serviceBar.fastDelivery.title')}</p>
                <p className="text-xs text-gray-600">{t('serviceBar.fastDelivery.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('serviceBar.securePayment.title')}</p>
                <p className="text-xs text-gray-600">{t('serviceBar.securePayment.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('serviceBar.returns.title')}</p>
                <p className="text-xs text-gray-600">{t('serviceBar.returns.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Support</p>
                <p className="text-xs text-gray-600">Expert help available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
