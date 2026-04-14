'use client'

import { useTranslations } from 'next-intl'

interface DeliveryInfoProps {
  deliveryTime?: string
  warrantyMonths?: number
  inStock: boolean
}

export default function DeliveryInfo({ deliveryTime, warrantyMonths, inStock }: DeliveryInfoProps) {
  const t = useTranslations('deliveryInfo')
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Stock Status */}
      <div className="flex items-start gap-3">
        <svg
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${inStock ? 'text-green-600' : 'text-red-600'}`}
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
        <div>
          <p className="text-sm font-medium text-gray-900">
            {inStock ? t('stock.inStock') : t('stock.outOfStock')}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {inStock ? t('stock.fastDelivery') : t('stock.availableLater')}
          </p>
        </div>
      </div>

      {/* Delivery Time */}
      {deliveryTime && (
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">{t('delivery.title')}</p>
            <p className="text-xs text-gray-600 mt-0.5">{deliveryTime}</p>
          </div>
        </div>
      )}

      {/* Warranty */}
      {warrantyMonths && (
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">{t('warranty.title')}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {warrantyMonths >= 12
                ? `${Math.floor(warrantyMonths / 12)} ${Math.floor(warrantyMonths / 12) === 1 ? t('warranty.year') : t('warranty.years')}`
                : `${warrantyMonths} ${t('warranty.months')}`}
            </p>
          </div>
        </div>
      )}

      {/* Return Policy */}
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900">{t('returnPolicy.title')}</p>
          <p className="text-xs text-gray-600 mt-0.5">{t('returnPolicy.subtitle')}</p>
        </div>
      </div>
    </div>
  )
}
