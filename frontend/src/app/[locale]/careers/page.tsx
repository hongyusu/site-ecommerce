'use client'

import { useTranslations } from 'next-intl'

export default function CareersPage() {
  const t = useTranslations('pages.careers')

  const openPositions = [
    {
      title: t('positions.customerService.title'),
      location: t('positions.customerService.location'),
      description: t('positions.customerService.description'),
    },
    {
      title: t('positions.logistics.title'),
      location: t('positions.logistics.location'),
      description: t('positions.logistics.description'),
    },
    {
      title: t('positions.developer.title'),
      location: t('positions.developer.location'),
      description: t('positions.developer.description'),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 mb-12">
          {t('subtitle')}
        </p>

        <div className="space-y-8">
          {/* Why Join Us */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('why.title')}</h2>
            <p className="text-gray-600 mb-6">{t('why.description')}</p>
            <p className="text-gray-600">{t('why.benefits')}</p>
          </div>

          {/* Open Positions */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('positions.title')}</h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{position.title}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {position.location}
                        </span>
                      </div>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold text-sm whitespace-nowrap">
                      {t('positions.noPositions').includes('Currently') ? 'Learn More' : t('positions.noPositions')}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">{position.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('process.title')}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('process.step1.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('process.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('process.step2.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('process.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('process.step3.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('process.step3.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('process.step4.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('process.step4.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('contact.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('contact.description')}
            </p>
            <a
              href={`mailto:${t('contact.email')}`}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('contact.email')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
