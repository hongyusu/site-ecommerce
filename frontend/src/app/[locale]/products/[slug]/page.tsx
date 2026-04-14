'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import RatingStars from '@/components/RatingStars'
import ProductHighlights from '@/components/ProductHighlights'
import DeliveryInfo from '@/components/DeliveryInfo'
import TrustBadges from '@/components/TrustBadges'
import ProductReviews from '@/components/ProductReviews'
import RecentlyViewed, { addToRecentlyViewed } from '@/components/RecentlyViewed'

interface ProductImage {
  image_url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

interface ProductVariant {
  id: number
  sku: string
  name: string
  options: Record<string, string>
  price: number | null
  stock_quantity: number
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: string | number
  compare_at_price: string | number | null
  stock_quantity: number
  specifications: Record<string, any> | null
  key_features: string[] | null
  brand: string | null
  warranty_months: number | null
  weight_kg: string | number | null
  delivery_time_days: string | null
  rating_average: string | number | null
  rating_count: number
  is_featured: boolean
  is_deal: boolean
  images: ProductImage[]
  variants: ProductVariant[]
}

function WishlistButton({ productId }: { productId: number }) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const inWishlist = isInWishlist(productId)

  const toggle = async () => {
    if (!isAuthenticated) return
    if (inWishlist) {
      await removeItem(productId)
    } else {
      await addItem(productId)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`p-3.5 rounded-lg border-2 transition-all ${
        inWishlist
          ? 'border-red-300 bg-red-50 text-red-500'
          : 'border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500'
      }`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      // Fetch all products and find by slug
      const { data } = await api.get('/products', {
        params: {
          page_size: 100,
          locale: locale
        }
      })
      const foundProduct = data.items.find((p: Product) => p.slug === params.slug)

      if (foundProduct) {
        setProduct(foundProduct)
        // Set primary image or first image
        const primaryImage = foundProduct.images.find((img: ProductImage) => img.is_primary)
        setSelectedImage(primaryImage?.image_url || foundProduct.images[0]?.image_url || '')
        document.title = `${foundProduct.name} | Mall & More`
        const primaryImg = foundProduct.images.find((i: ProductImage) => i.is_primary)
        addToRecentlyViewed({
          id: foundProduct.id, name: foundProduct.name, slug: foundProduct.slug,
          price: Number(foundProduct.price),
          image_url: primaryImg?.image_url || foundProduct.images[0]?.image_url || null,
          rating_average: Number(foundProduct.rating_average) || 0,
        })
      } else {
        setError('Product not found')
      }
    } catch (err: any) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const { addItem } = useCartStore()

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    setCartMessage('')
    setCartError('')
    try {
      await addItem(product!.id, quantity, selectedVariant?.id || null)
      setCartMessage(t('cart.addedToCart'))
      setTimeout(() => setCartMessage(''), 3000)
    } catch (err: any) {
      setCartError(err.response?.data?.detail || t('cart.outOfStock'))
      setTimeout(() => setCartError(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <p className="mt-3 text-sm text-gray-600">{t('productDetail.loading')}</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error || t('products.notFound')}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href={`/${locale}`} className="text-gray-600 hover:text-primary-600">
              {t('productDetail.breadcrumbs.home')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href={`/${locale}/products`} className="text-gray-600 hover:text-primary-600">
              {t('productDetail.breadcrumbs.products')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {t('productDetail.noImageAvailable')}
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === image.image_url
                        ? 'border-primary-600 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex gap-2 mb-3">
              {product.is_featured && (
                <div className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Featured</span>
                </div>
              )}
              {product.is_deal && (
                <span className="bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                  {t('products.deal')}
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

            {/* Brand and Rating */}
            <div className="flex items-center gap-4 mb-3">
              {product.brand && (
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{t('productDetail.brand')}:</span> {product.brand}
                </span>
              )}
              {product.rating_average && Number(product.rating_average) > 0 && (
                <RatingStars
                  rating={Number(product.rating_average)}
                  count={product.rating_count}
                  size="sm"
                />
              )}
            </div>

            {product.short_description && (
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">{product.short_description}</p>
            )}

            {/* Price Section - Enhanced */}
            <div className="mb-5 pb-5 border-b border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {Number(product.price).toFixed(2)} €
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-gray-400 line-through">
                      {Number(product.compare_at_price).toFixed(2)} €
                    </span>
                  )}
                </div>
                {product.compare_at_price && (
                  <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-3 py-1.5 rounded-md w-fit">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold">
                      {t('products.savePercent', {
                        percent: Math.round(
                          ((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100
                        )
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div className="mb-5">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('products.inStock', { count: product.stock_quantity })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{t('products.outOfStock')}</span>
                </div>
              )}
            </div>

            {/* Variant selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {Object.keys(product.variants[0].options).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' / ')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter(v => v.stock_quantity > 0).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === variant.id ? null : variant)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {variant.name}
                      {variant.price && Number(variant.price) !== Number(product.price) && (
                        <span className="ml-1 text-xs text-gray-500">&euro;{Number(variant.price).toFixed(2)}</span>
                      )}
                    </button>
                  ))}
                  {product.variants.filter(v => v.stock_quantity === 0).map((variant) => (
                    <button
                      key={variant.id}
                      disabled
                      className="px-4 py-2 border-2 border-gray-100 rounded-lg text-sm text-gray-300 line-through cursor-not-allowed"
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedVariant.stock_quantity} in stock
                    {selectedVariant.price && ` · €${Number(selectedVariant.price).toFixed(2)}`}
                  </p>
                )}
              </div>
            )}

            {/* Quantity selector */}
            {product.stock_quantity > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('productDetail.quantity')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-600 font-bold text-lg text-gray-900 transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 px-3 border-2 border-gray-300 rounded-lg text-center font-bold text-lg text-gray-900 bg-white focus:outline-none focus:border-primary-600"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-600 font-bold text-lg text-gray-900 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart + wishlist */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 py-3.5 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{product.stock_quantity === 0 ? t('products.outOfStock') : t('products.addToCart')}</span>
              </button>
              <WishlistButton productId={product.id} />
            </div>

            {cartMessage && (
              <p className="mt-2 text-sm text-green-600 text-center font-medium">{cartMessage}</p>
            )}
            {cartError && (
              <p className="mt-2 text-sm text-red-600 text-center">{cartError}</p>
            )}

            {/* Delivery Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <DeliveryInfo
                deliveryTime={product.delivery_time_days || undefined}
                warrantyMonths={product.warranty_months || undefined}
                inStock={product.stock_quantity > 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description and Specifications - Full Width Below */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('productDetail.description')}
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {t('productDetail.specifications')}
            </h2>
            <dl className="space-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <dt className="text-sm font-semibold text-gray-600">{key}</dt>
                  <dd className="text-sm text-gray-900 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Additional Product Information */}
      <div className="mt-8 space-y-6">
        {/* Product Highlights */}
        {product.key_features && product.key_features.length > 0 && (
          <ProductHighlights features={product.key_features} />
        )}

        {/* Trust Badges */}
        <TrustBadges />

        {/* Product Reviews */}
        <ProductReviews
          productId={product.id}
          averageRating={Number(product.rating_average) || 0}
          totalReviews={product.rating_count || 0}
        />

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  )
}
