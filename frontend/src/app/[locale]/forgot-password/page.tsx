"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import Link from "next/link"
import { Mail } from "lucide-react"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/auth/forgot-password", { email })
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <Mail className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          If an account exists for <strong>{email}</strong>, we've sent a password reset link.
        </p>
        <Link
          href={`/${locale}/login`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {loading ? "..." : "Send Reset Link"}
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link href={`/${locale}/login`} className="text-primary-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  )
}
