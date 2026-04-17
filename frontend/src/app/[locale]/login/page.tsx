'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login request
      const { data: tokenData } = await api.post('/auth/login', formData)

      // Get user profile
      const { data: userData } = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      // Save auth state
      setAuth(userData, tokenData.access_token, tokenData.refresh_token)

      // Redirect to home
      router.push(`/${locale}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {t('auth.login.title')}
            </h2>
            <p className="mt-1.5 text-center text-xs text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link href={`/${locale}/register`} className="font-medium text-primary-600 hover:text-primary-700">
                {t('auth.login.registerLink')}
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-900 mb-1">
                  {t('auth.login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-900 mb-1">
                  {t('auth.login.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href={`/${locale}/forgot-password`} className="text-xs text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.login.submit')}
              </button>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">Demo accounts — click to auto-fill:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@example.com', password: 'admin123' })}
                  className="flex-1 py-2 px-3 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'customer1@example.com', password: 'password123' })}
                  className="flex-1 py-2 px-3 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Customer
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
