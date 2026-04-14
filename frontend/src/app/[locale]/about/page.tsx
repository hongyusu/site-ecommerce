'use client'

import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('pages.about')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Company Story */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('subtitle')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                {t('story.p1')}
              </p>
              <p className="text-gray-600">
                {t('story.p2')}
              </p>
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('values.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('values.quality.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('values.quality.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('values.service.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('values.service.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('values.price.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('values.price.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('values.sustainability.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('values.sustainability.description')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t('stats.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{t('stats.customers', { count: '300,000' })}</div>
                <div className="text-sm text-gray-600">{t('stats.customers', { count: '' }).replace('300,000+ ', '')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{t('stats.products', { count: '50,000' })}</div>
                <div className="text-sm text-gray-600">{t('stats.products', { count: '' }).replace('50,000+ ', '')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{t('stats.orders', { count: '1,000,000' })}</div>
                <div className="text-sm text-gray-600">{t('stats.orders', { count: '' }).replace('1,000,000+ ', '')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{t('stats.satisfaction', { count: '98' })}</div>
                <div className="text-sm text-gray-600">{t('stats.satisfaction', { count: '' }).replace('98% ', '')}</div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('team.title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('team.description')}
            </p>
          </section>

          {/* Sustainability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sustainability.title')}</h2>
            <p className="text-gray-600">
              {t('sustainability.description')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
