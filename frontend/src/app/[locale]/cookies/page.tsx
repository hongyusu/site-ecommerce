'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function CookiesPage() {
  const t = useTranslations('pages.cookies')
  const [acceptedCategories, setAcceptedCategories] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  const handleToggle = (category: string) => {
    if (category === 'necessary') return
    setAcceptedCategories(prev => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev],
    }))
  }

  const handleAcceptAll = () => {
    setAcceptedCategories({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(acceptedCategories))
    alert('Cookie preferences saved')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-sm text-gray-600 mb-8">{t('lastUpdated', { date: '1.1.2025' })}</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* What are cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('intro.title')}</h2>
            <p className="text-gray-600 mb-3">
              {t('intro.description')}
            </p>
          </section>

          {/* Cookie Categories */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('types.title')}</h2>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('types.essential.title')}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('types.essential.description')}
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-primary-600 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Always on</span>
                  </div>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('types.performance.title')}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('types.performance.description')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('analytics')}
                    className="ml-4"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      acceptedCategories.analytics ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        acceptedCategories.analytics ? 'ml-auto' : ''
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('types.functional.title')}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('types.functional.description')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('functional')}
                    className="ml-4"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      acceptedCategories.functional ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        acceptedCategories.functional ? 'ml-auto' : ''
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('types.marketing.title')}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('types.marketing.description')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('marketing')}
                    className="ml-4"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      acceptedCategories.marketing ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        acceptedCategories.marketing ? 'ml-auto' : ''
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Preferences */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Accept All Cookies
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-white hover:bg-gray-50 text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors border-2 border-primary-600"
              >
                Save My Choices
              </button>
            </div>
          </section>

          {/* Cookie Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('preferences.title')}</h2>
            <p className="text-gray-600">
              {t('preferences.description')}
            </p>
          </section>

          {/* Third Party */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('thirdParty.title')}</h2>
            <p className="text-gray-600">
              {t('thirdParty.description')}
            </p>
          </section>

          {/* Contact */}
          <div className="bg-primary-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t('contact.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('contact.description')}
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> {t('contact.email')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
