// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  admin: {
    login: '/admin/login',
    artworks: '/admin/artworks',
    members: '/admin/members',
    approve: (id: number) => `/admin/artworks/${id}/approve`,
    reject: (id: number) => `/admin/artworks/${id}/reject`,
  },
  // Guest endpoints for public data
  guest: {
    artworks: '/guest/artworks',
    categories: '/guest/categories',
    exhibitions: '/guest/exhibitions',
    statistics: '/guest/statistics',
  },
  // Auth endpoints
  auth: {
    validate: '/auth/validate',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
} as const

// Response types
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  success?: boolean
  error?: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  totalCount: number
  skip: number
  take: number
}