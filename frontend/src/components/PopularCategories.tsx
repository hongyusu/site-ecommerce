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

export default function PopularCategories() {
  const locale = useLocale()
  const t = useTranslations('home')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      // Get main categories (no parent)
      const mainCategories = data.filter((cat: Category) => !cat.parent_id)
      setCategories(mainCategories.slice(0, 8))
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  return (
    <div className="bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('popularCategories')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/products?category=${category.id}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-shadow">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
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
  )
}
