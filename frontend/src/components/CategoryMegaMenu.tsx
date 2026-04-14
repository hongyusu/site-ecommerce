'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image_url: string | null
}

export default function CategoryMegaMenu() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parent_id)

  // Get subcategories for a parent
  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        className="flex items-center gap-2 text-gray-700 hover:text-primary-600 text-sm font-medium transition-colors whitespace-nowrap"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span>{t('categories')}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl w-[calc(100vw-3rem)] sm:w-[600px] lg:w-[800px]">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {mainCategories.slice(0, 6).map((category) => {
                const subcategories = getSubcategories(category.id)
                return (
                  <div key={category.id} className="space-y-3">
                    {/* Main Category Header */}
                    <Link
                      href={`/${locale}/products?category=${category.id}`}
                      className="flex items-center gap-2 group"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.image_url && (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                          {category.name}
                        </h3>
                      </div>
                    </Link>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <ul className="space-y-1.5 pl-2">
                        {subcategories.slice(0, 5).map((subcat) => (
                          <li key={subcat.id}>
                            <Link
                              href={`/${locale}/products?category=${subcat.id}`}
                              className="text-xs text-gray-600 hover:text-primary-600 hover:underline transition-colors block"
                              onClick={() => setIsOpen(false)}
                            >
                              {subcat.name}
                            </Link>
                          </li>
                        ))}
                        {subcategories.length > 5 && (
                          <li>
                            <Link
                              href={`/${locale}/categories`}
                              className="text-xs text-primary-600 hover:underline font-medium"
                            >
                              {t('viewAll')} →
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>

            {/* View All Categories Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <Link
                href={`/${locale}/categories`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {t('viewAllCategories')}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
