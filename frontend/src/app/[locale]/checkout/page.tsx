"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, MapPin, ShoppingCart, ChevronRight } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"

interface Address {
  id: number
  full_name: string
  phone: string | null
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string
  country: string
  is_default_shipping: boolean
}

export default function CheckoutPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { items, subtotal, fetchCart, itemCount } = useCartStore()

  const [step, setStep] = useState(1)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [customerNotes, setCustomerNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState<number | null>(null)
  const [orderNumber, setOrderNumber] = useState("")

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponFreeShipping, setCouponFreeShipping] = useState(false)
  const [couponMessage, setCouponMessage] = useState("")
  const [couponValid, setCouponValid] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCode, setAppliedCode] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
      return
    }
    const load = async () => {
      await fetchCart()
      try {
        const { data } = await api.get("/addresses")
        setAddresses(data)
        const defaultAddr = data.find((a: Address) => a.is_default_shipping)
        if (defaultAddr) setSelectedAddressId(defaultAddr.id)
        else if (data.length > 0) setSelectedAddressId(data[0].id)
      } catch {
        setError("Failed to load addresses")
      }
      setLoading(false)
    }
    load()
  }, [isAuthenticated, locale, router, fetchCart])

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  const taxAmount = subtotal * 0.24
  const baseShipping = subtotal >= 100 ? 0 : 5.9
  const shippingCost = couponFreeShipping ? 0 : baseShipping
  const total = subtotal + taxAmount + shippingCost - couponDiscount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponMessage("")
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        subtotal,
      })
      if (data.valid) {
        setCouponValid(true)
        setCouponDiscount(Number(data.discount_amount))
        setCouponFreeShipping(data.free_shipping)
        setCouponMessage(data.message)
        setAppliedCode(couponCode.trim().toUpperCase())
      } else {
        setCouponValid(false)
        setCouponDiscount(0)
        setCouponFreeShipping(false)
        setCouponMessage(data.message)
        setAppliedCode("")
      }
    } catch {
      setCouponMessage("Failed to validate coupon")
      setCouponValid(false)
    }
    setCouponLoading(false)
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setCouponDiscount(0)
    setCouponFreeShipping(false)
    setCouponMessage("")
    setCouponValid(false)
    setAppliedCode("")
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return
    setPlacing(true)
    setError("")
    try {
      const { data } = await api.post("/orders", {
        address_id: selectedAddressId,
        customer_notes: customerNotes || null,
        payment_method: "invoice",
        coupon_code: appliedCode || null,
      })
      setOrderId(data.id)
      setOrderNumber(data.order_number)
      setStep(3)
      await fetchCart()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail || "Failed to place order")
    } finally {
      setPlacing(false)
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    )
  }

  // Step 3: Confirmation
  if (step === 3) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t("checkout.thankYou")}
        </h1>
        <p className="text-gray-600 mb-1">{t("checkout.orderPlaced")}</p>
        <p className="text-lg font-semibold text-primary-600 mb-6">
          #{orderNumber}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale}/orders/${orderId}`}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 font-medium"
          >
            {t("checkout.viewOrder")}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="border border-gray-300 px-6 py-2 rounded text-gray-700 hover:bg-gray-50"
          >
            {t("cart.continueShopping")}
          </Link>
        </div>
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t("cart.empty")}</p>
        <Link
          href={`/${locale}/products`}
          className="inline-block bg-accent-500 text-white px-6 py-2 rounded hover:bg-accent-600"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t("checkout.title")}
      </h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={`px-3 py-1 rounded-full ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
          1. {t("checkout.shipping")}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className={`px-3 py-1 rounded-full ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
          2. {t("checkout.review")}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 1: Select Address */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold">{t("checkout.selectAddress")}</h2>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">{t("checkout.noAddresses")}</p>
                  <Link
                    href={`/${locale}/profile/addresses`}
                    className="text-accent-500 hover:text-accent-600 font-medium"
                  >
                    {t("addresses.addNew")}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block border rounded-lg p-4 cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="sr-only"
                        />
                        <p className="font-medium">{addr.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.postal_code} {addr.city}, {addr.country}
                        </p>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddressId}
                    className="mt-4 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                  >
                    {t("checkout.continue")}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2: Review & Place Order */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Address summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{t("checkout.shippingAddress")}</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-accent-500 hover:text-accent-600"
                  >
                    {t("addresses.edit")}
                  </button>
                </div>
                {selectedAddress && (
                  <div className="text-sm text-gray-600">
                    <p>{selectedAddress.full_name}</p>
                    <p>{selectedAddress.address_line1}</p>
                    <p>{selectedAddress.postal_code} {selectedAddress.city}, {selectedAddress.country}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold mb-3">{t("checkout.orderItems")}</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product_image_url && (
                        <img src={item.product_image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      &euro;{(Number(item.product_price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold mb-2">{t("checkout.coupon")}</h3>
                {appliedCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                    <div>
                      <span className="font-medium text-green-800">{appliedCode}</span>
                      <span className="text-sm text-green-600 ml-2">{couponMessage}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t("checkout.couponPlaceholder")}
                      className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                      {couponLoading ? "..." : t("checkout.applyCoupon")}
                    </button>
                  </div>
                )}
                {couponMessage && !couponValid && (
                  <p className="text-sm text-red-600 mt-2">{couponMessage}</p>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold mb-2">{t("checkout.notes")}</h3>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder={t("checkout.notesPlaceholder")}
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-accent-500 text-white py-3 rounded-lg hover:bg-accent-600 disabled:opacity-50 font-bold text-lg"
              >
                {placing ? "..." : t("checkout.placeOrder")}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="font-semibold mb-4">{t("checkout.orderSummary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("cart.subtotal")}</span>
                <span>&euro;{Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("checkout.tax")} (24%)</span>
                <span>&euro;{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("checkout.shipping")}</span>
                <span>{shippingCost === 0 ? t("checkout.free") : `€${shippingCost.toFixed(2)}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("checkout.discount")}</span>
                  <span>-&euro;{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponFreeShipping && baseShipping > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("checkout.freeShippingCoupon")}</span>
                  <span>-&euro;{baseShipping.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                <span>{t("cart.total")}</span>
                <span>&euro;{total.toFixed(2)}</span>
              </div>
            </div>
            {subtotal < 100 && (
              <p className="text-xs text-gray-500 mt-3">
                {t("checkout.freeShippingNote")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
