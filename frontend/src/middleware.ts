import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Automatically detect locale from headers
  localeDetection: true,

  // The locale prefix strategy
  // 'always': Always use locale prefix (e.g. /fi/products)
  // 'as-needed': Use prefix except for default locale
  localePrefix: 'always',
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fi|sv|en|zh)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
}
