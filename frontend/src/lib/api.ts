import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token and locale
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (Zustand persist)
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const { state } = JSON.parse(authStorage)
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    }

    // Add locale parameter to product and category endpoints
    if (typeof window !== 'undefined' && config.url) {
      // Extract locale from pathname (e.g., /en/products -> 'en')
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      const locale = pathSegments[0] || 'en'

      // Only add locale to product and category endpoints
      if (config.url.includes('/products') || config.url.includes('/categories')) {
        config.params = {
          ...config.params,
          locale: ['en', 'fi', 'sv', 'zh'].includes(locale) ? locale : 'en',
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth-storage')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
