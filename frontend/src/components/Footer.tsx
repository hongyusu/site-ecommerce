'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">{t('footer.brandName')}</h3>
            <p className="text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">{t('footer.customerService')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-primary-500 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shipping`} className="hover:text-primary-500 transition-colors">
                  {t('footer.shipping')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/returns`} className="hover:text-primary-500 transition-colors">
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-primary-500 transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-primary-500 transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/careers`} className="hover:text-primary-500 transition-colors">
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/press`} className="hover:text-primary-500 transition-colors">
                  {t('footer.press')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-primary-500 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-primary-500 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-primary-500 transition-colors">
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">{t('footer.paymentMethods')}</span>
              <div className="flex gap-2">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">VISA</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">MC</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">AMEX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
