'use client'

import { useTranslations } from 'next-intl'

export default function PressPage() {
  const t = useTranslations('pages.press')

  // Press releases would come from translation keys in a real app
  const pressReleases = [
    {
      date: '15.10.2024',
      title: 'E-Commerce Platform expanded revenue 45% in 2024',
      excerpt: 'Example press release content...',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-gray-600 mb-12">
          {t('subtitle')}
        </p>

        <div className="space-y-8">
          {/* Press Contact */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('media.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('media.name')}</h3>
                  <p className="text-gray-600">{t('media.email')}</p>
                  <p className="text-gray-600">{t('media.phone')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {t('media.description')}
              </p>
            </div>
          </div>

          {/* Press Releases */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('releases.title')}</h2>
            <p className="text-gray-600">{t('releases.noReleases')}</p>
          </div>

          {/* Brand Assets */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('assets.title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('assets.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{t('assets.logo')}</div>
                    <div className="text-sm text-gray-600">PNG, SVG</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              <button className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{t('assets.guidelines')}</div>
                    <div className="text-sm text-gray-600">PDF</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              <button className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{t('assets.images')}</div>
                    <div className="text-sm text-gray-600">High-res JPG</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('facts.title')}</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.founded')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.headquarters')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.employees')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.languages')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.countries')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.customers')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.products')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-semibold">•</span>
                <div>
                  <span className="text-gray-600">{t('facts.dailyOrders')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-primary-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('media.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('media.description')}
            </p>
            <a
              href={`mailto:${t('media.email')}`}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('media.email')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
