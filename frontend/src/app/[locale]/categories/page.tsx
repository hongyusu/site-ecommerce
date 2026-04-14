'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: number | null
  display_order: number
  is_active: boolean
}

interface CategoryWithCount extends Category {
  productCount: number
}

export default function CategoriesPage() {
  const locale = useLocale()
  const t = useTranslations()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')

      // Fetch product count for each category
      const withCounts = await Promise.all(
        data.map(async (cat: Category) => {
          try {
            const { data: prods } = await api.get('/products', {
              params: { category_id: cat.id, page_size: 1 },
            })
            return { ...cat, productCount: prods.total }
          } catch {
            return { ...cat, productCount: 0 }
          }
        })
      )
      setCategories(withCounts)
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  // Group categories by parent
  const parentCategories = categories.filter((cat) => !cat.parent_id)
  const getSubcategories = (parentId: number) =>
    categories.filter((cat) => cat.parent_id === parentId)

  // Calculate total products for a parent (its own + subcategories)
  const getTotalProducts = (parentId: number) => {
    const parent = categories.find((c) => c.id === parentId)
    const subs = getSubcategories(parentId)
    const parentCount = parent?.productCount || 0
    // Parent count already includes subcategory products via backend query
    return parentCount
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{t('categories.title')}</h1>
        <p className="text-sm text-gray-500">
          {categories.length} categories &middot; {categories.reduce((sum, c) => sum + (c.parent_id ? 0 : c.productCount), 0)} products
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {t('categories.failedToLoad')}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="mt-3 text-sm text-gray-600">{t('categories.loading')}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-base">{t('categories.noCategories')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentCategories.map((parentCategory) => {
            const subcategories = getSubcategories(parentCategory.id)
            const totalProducts = getTotalProducts(parentCategory.id)

            return (
              <div key={parentCategory.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Parent Category Header */}
                <Link
                  href={`/${locale}/products?category=${parentCategory.id}`}
                  className="block group"
                >
                  <div className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    {parentCategory.image_url && (
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-50 mr-4 flex-shrink-0">
                        <img
                          src={parentCategory.image_url}
                          alt={parentCategory.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {parentCategory.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                        {subcategories.length > 0 && ` · ${subcategories.length} subcategories`}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/${locale}/products?category=${subcategory.id}`}
                          className="group"
                        >
                          <div className="bg-white rounded p-3 hover:shadow-lg hover:border-primary-300 transition-all border border-gray-200">
                            {subcategory.image_url && (
                              <div className="w-full aspect-square rounded overflow-hidden bg-gray-50 mb-2">
                                <img
                                  src={subcategory.image_url}
                                  alt={subcategory.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <h4 className="text-xs font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                              {subcategory.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {subcategory.productCount} products
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
