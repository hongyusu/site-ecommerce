import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce Platform',
  description: 'Quality products, fast delivery, competitive prices.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
