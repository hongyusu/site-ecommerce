'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    preferred_language: 'fi',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Salasanat eivät täsmää')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Salasanan tulee olla vähintään 8 merkkiä pitkä')
      return
    }

    setLoading(true)

    try {
      // Register request
      const { confirmPassword, ...registerData } = formData
      await api.post('/auth/register', registerData)

      // Redirect to login with verification notice
      router.push(`/${locale}/login?verify=true`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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
              {t('auth.register.title')}
            </h2>
            <p className="mt-1.5 text-center text-xs text-gray-600">
              {t('auth.register.hasAccount')}{' '}
              <Link href={`/${locale}/login`} className="font-medium text-primary-600 hover:text-primary-700">
                {t('auth.register.loginLink')}
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-medium text-gray-900 mb-1">
                    Etunimi
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-xs font-medium text-gray-900 mb-1">
                    Sukunimi
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-900 mb-1">
                  {t('auth.register.email')}
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
                <label htmlFor="phone" className="block text-xs font-medium text-gray-900 mb-1">
                  Puhelin (valinnainen)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="preferred_language" className="block text-xs font-medium text-gray-900 mb-1">
                  Kieli
                </label>
                <select
                  id="preferred_language"
                  name="preferred_language"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                >
                  <option value="fi">Suomi</option>
                  <option value="sv">Svenska</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-900 mb-1">
                  {t('auth.register.password')}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-900 mb-1">
                  {t('auth.register.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.register.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
