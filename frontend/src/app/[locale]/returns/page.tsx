'use client'

import { useTranslations } from 'next-intl'

export default function ReturnsPage() {
  const t = useTranslations('pages.returns')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Return Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('policy.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('policy.description')}
            </p>
          </section>

          {/* How to Return */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('howTo.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('howTo.step1.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('howTo.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('howTo.step2.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('howTo.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('howTo.step3.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('howTo.step3.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('howTo.step4.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('howTo.step4.description')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Return Address */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('address.title')}</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="font-semibold text-gray-900">{t('address.company')}</p>
              <p className="text-gray-600">{t('address.department')}</p>
              <p className="text-gray-600">{t('address.poBox')}</p>
              <p className="text-gray-600">{t('address.city')}</p>
            </div>
          </section>

          {/* Return Costs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('costs.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-600">
                  {t('costs.defective')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-600">
                  {t('costs.over100')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-gray-600">
                  {t('costs.other')}
                </p>
              </div>
            </div>
          </section>

          {/* Exchange */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('exchange.title')}</h2>
            <p className="text-gray-600">
              {t('exchange.description')}
            </p>
          </section>

          {/* Exceptions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('exceptions.title')}</h2>
            <p className="text-gray-600 mb-3">
              {t('exceptions.description')}
            </p>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('exceptions.hygiene')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('exceptions.custom')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('exceptions.sealed')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>{t('exceptions.perishable')}</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-primary-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t('contact.title')}</h3>
            <p className="text-gray-600 mb-4">
              {t('contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:palautukset@mallandmore.fi"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('contact.email')}
              </a>
              <a
                href="tel:+358201234567"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-600 px-6 py-2 rounded-lg transition-colors font-semibold text-sm border-2 border-primary-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('contact.phone')}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
