"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, MapPin, ClipboardList } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function ProfilePage() {
  const t = useTranslations("profile")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated, setAuth, accessToken, refreshToken } = useAuthStore()

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    preferred_language: "fi",
  })
  const [profileMsg, setProfileMsg] = useState("")
  const [profileErr, setProfileErr] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordErr, setPasswordErr] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
    }
  }, [isAuthenticated, locale, router])

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: (user as unknown as Record<string, string>).phone || "",
        preferred_language: user.preferred_language || "fi",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg("")
    setProfileErr("")
    setProfileLoading(true)
    try {
      const { data } = await api.patch("/auth/me", profileForm)
      if (accessToken && refreshToken) {
        setAuth(data, accessToken, refreshToken)
      }
      setProfileMsg(t("saved"))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setProfileErr(error.response?.data?.detail || "Error updating profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg("")
    setPasswordErr("")

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordErr(t("passwordMismatch"))
      return
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordErr("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)
    try {
      await api.post("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setPasswordMsg(t("passwordChanged"))
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setPasswordErr(error.response?.data?.detail || "Error changing password")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t("personalInfo")}</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, first_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("phone")}
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("language")}
              </label>
              <select
                value={profileForm.preferred_language}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, preferred_language: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fi">Suomi</option>
                <option value="sv">Svenska</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            {profileMsg && (
              <p className="text-sm text-green-600">{profileMsg}</p>
            )}
            {profileErr && (
              <p className="text-sm text-red-600">{profileErr}</p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {profileLoading ? "..." : t("saveChanges")}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">{t("changePassword")}</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("currentPassword")}
              </label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current_password: e.target.value })
                }
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("newPassword")}
              </label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new_password: e.target.value })
                }
                required
                minLength={8}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("confirmPassword")}
              </label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                }
                required
                minLength={8}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {passwordMsg && (
              <p className="text-sm text-green-600">{passwordMsg}</p>
            )}
            {passwordErr && (
              <p className="text-sm text-red-600">{passwordErr}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {passwordLoading ? "..." : t("changePassword")}
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/profile/addresses`}
          className="flex items-center gap-3 bg-white rounded-lg shadow-sm border p-4 hover:border-primary-300"
        >
          <MapPin className="w-5 h-5 text-primary-600" />
          <span className="font-medium">{t("manageAddresses")}</span>
        </Link>
        <Link
          href={`/${locale}/profile/orders`}
          className="flex items-center gap-3 bg-white rounded-lg shadow-sm border p-4 hover:border-primary-300"
        >
          <ClipboardList className="w-5 h-5 text-primary-600" />
          <span className="font-medium">{t("orderHistory")}</span>
        </Link>
      </div>
    </div>
  )
}
