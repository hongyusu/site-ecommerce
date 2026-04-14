"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface ReviewItem {
  id: number
  product_id: number
  product_name: string
  user_email: string
  user_name: string
  rating: number
  title: string
  comment: string
  verified_purchase: boolean
  helpful_count: number
  created_at: string
}

export default function AdminReviewsPage() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [ratingFilter, setRatingFilter] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push(`/${locale}`)
      return
    }
    fetchReviews()
  }, [isAuthenticated, user, page, ratingFilter, locale, router])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "15" })
      if (ratingFilter) {
        params.set("min_rating", ratingFilter)
        params.set("max_rating", ratingFilter)
      }
      const { data } = await api.get(`/reviews?${params}`)
      setReviews(data.items)
      setTotalPages(data.pages)
      setTotal(data.total)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      await fetchReviews()
    } catch {
      // ignore
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  if (!isAuthenticated || user?.role !== "admin") return null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/${locale}/admin`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Moderation</h1>
          <p className="text-sm text-gray-500">{total} reviews total</p>
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <span className="font-semibold text-gray-800">{review.title}</span>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      By <span className="font-medium">{review.user_name}</span> ({review.user_email})
                    </span>
                    <span>|</span>
                    <Link
                      href={`/${locale}/products/${review.product_id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {review.product_name}
                    </Link>
                    <span>|</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    {review.helpful_count > 0 && (
                      <>
                        <span>|</span>
                        <span>{review.helpful_count} helpful</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${
                page === i + 1 ? "bg-primary-600 text-white" : "bg-white border hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
