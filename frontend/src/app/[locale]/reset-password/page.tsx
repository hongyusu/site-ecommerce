"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import api from "@/lib/api"

export default function ResetPasswordPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Reset failed. The link may have expired.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600">Invalid reset link.</p>
        <Link href={`/${locale}/forgot-password`} className="text-primary-600 hover:underline mt-4 inline-block">
          Request a new link
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h1>
        <p className="text-gray-600 mb-6">Your password has been updated successfully.</p>
        <Link
          href={`/${locale}/login`}
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 font-medium"
        >
          Log In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Set New Password</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {loading ? "..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}
