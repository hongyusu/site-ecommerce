'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import RatingStars from './RatingStars'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Review {
  id: number
  rating: number
  title: string
  comment: string
  created_at: string
  verified_purchase: boolean
  helpful_count: number
}

interface ProductReviewsProps {
  productId: number
  averageRating: number
  totalReviews: number
  ratingDistribution?: { [key: number]: number }
}

export default function ProductReviews({
  productId,
  averageRating,
  totalReviews,
  ratingDistribution: initialRatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
}: ProductReviewsProps) {
  const t = useTranslations()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>(initialRatingDistribution)
  const [fetchedAverageRating, setFetchedAverageRating] = useState(averageRating)
  const [fetchedTotalReviews, setFetchedTotalReviews] = useState(totalReviews)

  // Review form state
  const { isAuthenticated } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState('')
  const [formComment, setFormComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitErr, setSubmitErr] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [productId, page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/products/${productId}/reviews?page=${page}&page_size=5`)
      setReviews(data.items)
      setTotalPages(data.pages)

      // Convert string keys to numbers for rating distribution
      const distribution = data.rating_distribution || initialRatingDistribution
      const numericDistribution: { [key: number]: number } = {}
      Object.keys(distribution).forEach(key => {
        numericDistribution[parseInt(key)] = distribution[key]
      })
      setRatingDistribution(numericDistribution)

      setFetchedAverageRating(parseFloat(data.average_rating) || averageRating)
      setFetchedTotalReviews(data.total || totalReviews)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMsg('')
    setSubmitErr('')
    setSubmitting(true)
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating: formRating,
        title: formTitle,
        comment: formComment,
      })
      setSubmitMsg('Review submitted successfully!')
      setFormTitle('')
      setFormComment('')
      setFormRating(5)
      setShowForm(false)
      setPage(1)
      await fetchReviews()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setSubmitErr(error.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const hasReviews = fetchedTotalReviews > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('reviews.title')}</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {fetchedAverageRating.toFixed(1)}
            </div>
            <RatingStars rating={fetchedAverageRating} size="lg" showCount={false} />
            <p className="text-sm text-gray-600 mt-2">
              {fetchedTotalReviews} {t('reviews.title').toLowerCase()}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0
              const percentage = fetchedTotalReviews > 0 ? (count / fetchedTotalReviews) * 100 : 0

              return (
                <div key={stars} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-700 w-12">
                    {stars} {t('reviews.stars')}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Write Review */}
      <div className="p-6 border-b border-gray-200">
        {submitMsg && <p className="text-sm text-green-600 mb-3">{submitMsg}</p>}
        {submitErr && <p className="text-sm text-red-600 mb-3">{submitErr}</p>}

        {!showForm ? (
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setSubmitErr(t('reviews.loginRequired'))
                return
              }
              setShowForm(true)
              setSubmitMsg('')
              setSubmitErr('')
            }}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            {t('reviews.writeReview')}
          </button>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <h3 className="font-semibold text-gray-900">{t('reviews.writeReview')}</h3>

            {/* Star selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviews.rating')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= formRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviews.reviewTitle')}</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviews.reviewComment')}</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                required
                rows={4}
                placeholder="What did you like or dislike about this product?"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white px-5 py-2 rounded hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
              >
                {submitting ? '...' : t('reviews.submitReview')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="p-6">
        {!hasReviews ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('reviews.noReviews')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('reviews.beFirst')}
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-3 text-sm text-gray-600">{t('reviews.loading')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <RatingStars rating={review.rating} size="sm" showCount={false} />
                      <h4 className="font-semibold text-gray-900 mt-1">{review.title}</h4>
                    </div>
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {t('reviews.verifiedPurchase')}
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>

                  {/* Review Footer */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(review.created_at)}</span>
                    {review.helpful_count > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {t('reviews.helpful', { count: review.helpful_count })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm text-gray-700 font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.previous')}
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 font-medium">
                  {t('reviews.page', { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-gray-700 font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
