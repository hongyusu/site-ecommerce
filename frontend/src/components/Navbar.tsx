'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import api from '@/lib/api'
import LanguageSwitcher from './LanguageSwitcher'

interface AutocompleteResult {
  id: number
  name: string
  slug: string
  price: number
  image_url: string | null
}
import CategoryMegaMenu from './CategoryMegaMenu'

export default function Navbar() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount, fetchCart, resetCart } = useCartStore()
  const { items: wishlistItems, fetchWishlist, resetWishlist } = useWishlistStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
      fetchWishlist()
    } else {
      resetCart()
      resetWishlist()
    }
  }, [isAuthenticated, fetchCart, resetCart])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/autocomplete?q=${encodeURIComponent(searchQuery)}`)
        setSuggestions(data)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleLogout = () => {
    logout()
    router.push(`/${locale}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${locale}/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-6 h-14">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-600">Mall & More</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={(e) => { handleSearch(e); setShowSuggestions(false) }} className="hidden sm:block flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-primary-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/products/${s.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                      onClick={() => { setShowSuggestions(false); setSearchQuery('') }}
                    >
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{s.name}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-600">&euro;{s.price.toFixed(2)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Main Navigation (desktop) */}
          <div className="hidden lg:flex items-center space-x-6">
            <CategoryMegaMenu />
            <Link
              href={`/${locale}/products`}
              className="text-gray-700 hover:text-primary-600 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('nav.products')}
            </Link>
            <Link
              href={`/${locale}/deals`}
              className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('nav.deals')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Language Switcher (desktop) */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Wishlist */}
            <Link
              href={`/${locale}/wishlist`}
              className="relative text-gray-700 hover:text-red-500 transition-colors"
              title="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold" style={{fontSize: '10px'}}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href={`/${locale}/cart`}
              className="relative text-gray-700 hover:text-primary-600 transition-colors"
              title={t('common.cart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 text-xs whitespace-nowrap">
                  {t('common.hello')}, {user?.first_name}
                </span>
                {user?.role === 'admin' && (
                  <Link
                    href={`/${locale}/admin`}
                    className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href={`/${locale}/profile`}
                  className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap"
                >
                  {t('common.account')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  {t('common.register')}
                </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
          <Link href={`/${locale}/products`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
            {t('nav.products')}
          </Link>
          <Link href={`/${locale}/deals`} className="block text-sm font-medium text-red-500 py-1" onClick={() => setMobileMenuOpen(false)}>
            {t('nav.deals')}
          </Link>
          <Link href={`/${locale}/categories`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
            {t('nav.categories')}
          </Link>
          <Link href={`/${locale}/track-order`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
            {t('nav.trackOrder')}
          </Link>
          <hr />
          {isAuthenticated ? (
            <>
              <Link href={`/${locale}/profile`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
                {t('common.account')}
              </Link>
              <Link href={`/${locale}/wishlist`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
                {t('wishlist.title')}
              </Link>
              <Link href={`/${locale}/profile/orders`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.myOrders')}
              </Link>
              {user?.role === 'admin' && (
                <Link href={`/${locale}/admin`} className="block text-sm font-medium text-primary-600 py-1" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.adminPanel')}
                </Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="block text-sm font-medium text-gray-700 py-1">
                {t('common.logout')}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileMenuOpen(false)}>
                {t('common.login')}
              </Link>
              <Link href={`/${locale}/register`} className="block text-sm font-medium text-primary-600 py-1" onClick={() => setMobileMenuOpen(false)}>
                {t('common.register')}
              </Link>
            </>
          )}
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  )
}
