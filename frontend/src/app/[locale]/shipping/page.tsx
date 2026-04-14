'use client'

import { useTranslations } from 'next-intl'

export default function ShippingPage() {
  const t = useTranslations('pages.shipping')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Shipping Options */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('title')}</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('express.title')}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {t('express.description')}
                    </p>
                    <p className="text-primary-600 font-semibold">{t('express.price')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('home.title')}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {t('home.description')}
                    </p>
                    <p className="text-primary-600 font-semibold">{t('home.price')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('pickup.title')}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {t('pickup.description')}
                    </p>
                    <p className="text-primary-600 font-semibold">{t('pickup.price')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t('free.title')}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {t('free.description')}
                    </p>
                    <p className="text-accent-600 font-semibold">{t('free.price')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Times */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('times.title')}</h2>
            <div className="prose prose-gray max-w-none">
              <ul className="text-gray-600 space-y-2 mt-4">
                <li>{t('times.inStock')}</li>
                <li>{t('times.order')}</li>
                <li>{t('times.special')}</li>
              </ul>
            </div>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('tracking.title')}</h2>
            <p className="text-gray-600">
              {t('tracking.description')}
            </p>
          </section>

          {/* Delivery Areas */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('areas.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('areas.description')}
            </p>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('areas.ahvenanmaa')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('areas.archipelago')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('areas.large')}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
