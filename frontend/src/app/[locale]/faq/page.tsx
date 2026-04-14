'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function FAQPage() {
  const t = useTranslations('pages.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: t('ordering.title'),
      questions: [
        {
          q: t('ordering.howToOrder.q'),
          a: t('ordering.howToOrder.a'),
        },
        {
          q: t('ordering.changeOrder.q'),
          a: t('ordering.changeOrder.a'),
        },
        {
          q: t('ordering.cancelOrder.q'),
          a: t('ordering.cancelOrder.a'),
        },
      ],
    },
    {
      category: t('payment.title'),
      questions: [
        {
          q: t('payment.methods.q'),
          a: t('payment.methods.a'),
        },
        {
          q: t('payment.secure.q'),
          a: t('payment.secure.a'),
        },
        {
          q: t('payment.when.q'),
          a: t('payment.when.a'),
        },
      ],
    },
    {
      category: t('delivery.title'),
      questions: [
        {
          q: t('delivery.time.q'),
          a: t('delivery.time.a'),
        },
        {
          q: t('delivery.cost.q'),
          a: t('delivery.cost.a'),
        },
        {
          q: t('delivery.track.q'),
          a: t('delivery.track.a'),
        },
      ],
    },
    {
      category: t('returns.title'),
      questions: [
        {
          q: t('returns.howTo.q'),
          a: t('returns.howTo.a'),
        },
        {
          q: t('returns.costs.q'),
          a: t('returns.costs.a'),
        },
        {
          q: t('returns.refund.q'),
          a: t('returns.refund.a'),
        },
      ],
    },
    {
      category: t('products.title'),
      questions: [
        {
          q: t('products.warranty.q'),
          a: t('products.warranty.a'),
        },
        {
          q: t('products.defective.q'),
          a: t('products.defective.a'),
        },
        {
          q: t('products.genuine.q'),
          a: t('products.genuine.a'),
        },
      ],
    },
    {
      category: t('account.title'),
      questions: [
        {
          q: t('account.need.q'),
          a: t('account.need.a'),
        },
        {
          q: t('account.create.q'),
          a: t('account.create.a'),
        },
        {
          q: t('account.forgot.q'),
          a: t('account.forgot.a'),
        },
      ],
    },
  ]

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const index = categoryIndex * 100 + questionIndex
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-gray-600 mb-8">
          {t('subtitle')}
        </p>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const index = categoryIndex * 100 + questionIndex
                  const isOpen = openIndex === index
                  return (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                        <svg
                          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-primary-50 rounded-lg p-8 text-center mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('notFound.title')}</h2>
          <p className="text-gray-600 mb-4">
            {t('notFound.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/fi/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('notFound.contact')}
            </a>
            <a
              href="tel:+358201234567"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-600 px-6 py-3 rounded-lg transition-colors font-semibold border-2 border-primary-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('notFound.phone')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
