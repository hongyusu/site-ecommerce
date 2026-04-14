"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/api"

export default function VerifyEmailPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided.")
      return
    }

    const verify = async () => {
      try {
        const { data } = await api.post(`/auth/verify-email?token=${token}`)
        setStatus("success")
        setMessage(data.message)
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } }
        setStatus("error")
        setMessage(e.response?.data?.detail || "Verification failed")
      }
    }
    verify()
  }, [token])

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      {status === "loading" && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 font-medium"
          >
            Log In
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 font-medium"
          >
            Back to Login
          </Link>
        </>
      )}
    </div>
  )
}
