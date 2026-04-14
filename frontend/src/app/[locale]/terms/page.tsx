'use client'

import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('pages.terms')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-sm text-gray-600 mb-8">{t('lastUpdated', { date: '1.1.2025' })}</p>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('agreement.title')}</h2>
            <p className="text-gray-600">
              {t('agreement.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('usage.title')}</h2>
            <p className="text-gray-600 mb-3">
              {t('usage.description')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>{t('usage.item1')}</li>
              <li>{t('usage.item2')}</li>
              <li>{t('usage.item3')}</li>
              <li>{t('usage.item4')}</li>
              <li>{t('usage.item5')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('intellectualProperty.title')}</h2>
            <p className="text-gray-600">
              {t('intellectualProperty.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('limitation.title')}</h2>
            <p className="text-gray-600">
              {t('limitation.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('disclaimer.title')}</h2>
            <p className="text-gray-600">
              {t('disclaimer.description')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
