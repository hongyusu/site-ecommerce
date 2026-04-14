'use client'

import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations('pages.privacy')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-sm text-gray-600 mb-8">{t('lastUpdated', { date: '1.1.2025' })}</p>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('intro.title')}</h2>
            <p className="text-gray-600">
              {t('intro.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('collection.title')}</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('collection.personal.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('collection.personal.description')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('collection.payment.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('collection.payment.description')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('collection.usage.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('collection.usage.description')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('collection.cookies.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('collection.cookies.description')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('use.title')}</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>{t('use.item1')}</li>
              <li>{t('use.item2')}</li>
              <li>{t('use.item3')}</li>
              <li>{t('use.item4')}</li>
              <li>{t('use.item5')}</li>
              <li>{t('use.item6')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('gdpr.title')}</h2>
            <p className="text-gray-600">
              {t('gdpr.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('retention.title')}</h2>
            <p className="text-gray-600">
              {t('retention.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-600 mb-3">
              {t('contact.description')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
              <p><strong>Email:</strong> {t('contact.email')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
