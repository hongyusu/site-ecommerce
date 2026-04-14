import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceBar from '@/components/ServiceBar'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Mall & More - Online Store',
    template: '%s | Mall & More',
  },
  description: 'Quality products, fast delivery, competitive prices. Shop electronics, home & garden, clothing, and more across Europe.',
  keywords: ['online store', 'e-commerce', 'electronics', 'shopping', 'Europe', 'Finland'],
  openGraph: {
    type: 'website',
    siteName: 'Mall & More',
    title: 'Mall & More - Online Store',
    description: 'Quality products, fast delivery, competitive prices.',
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  // Await params if it's a promise (Next.js 15+)
  const { locale } = 'then' in params ? await params : params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#232f3e" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <ServiceBar />
          <main className="flex-1 bg-gray-50">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
