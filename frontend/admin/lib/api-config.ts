// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

export const API_ENDPOINTS = {
  // Admin endpoints
  admin: {
    login: '/admin/login',
    profile: '/admin/profile',
    dashboard: '/admin/dashboard',
    activities: '/admin/dashboard/activities',
    
    // Members
    members: '/admin/members',
    allMembers: '/admin/members/all',
    memberDetails: (id: number) => `/admin/members/${id}`,
    approveMember: (id: number) => `/admin/members/${id}/approve`,
    rejectMember: (id: number) => `/admin/members/${id}/reject`,
    
    // Artworks
    artworks: '/admin/artworks',
    allArtworks: '/admin/artworks/all',
    pendingArtworks: '/admin/artworks/pending',
    artworkDetails: (id: number) => `/admin/artworks/${id}`,
    approveArtwork: (id: number) => `/admin/artworks/${id}/approve`,
    rejectArtwork: (id: number) => `/admin/artworks/${id}/reject`,
    updateArtwork: (id: number) => `/admin/artworks/${id}`,
    deleteArtwork: (id: number) => `/admin/artworks/${id}`,
    updateArtworkStatus: (id: number) => `/admin/artworks/${id}/status`,
    
    // Transactions
    transactions: '/admin/transactions',
    allTransactions: '/admin/transactions/all',
    transactionDetails: (id: number) => `/admin/transactions/${id}`,
    transactionsByDateRange: '/admin/transactions/date-range',
    
    // Purchase Requests
    purchaseRequests: '/admin/purchase-requests',
    allPurchaseRequests: '/admin/purchase-requests/all',
    approvePurchaseRequest: (id: number) => `/admin/purchase-requests/${id}/approve`,
    rejectPurchaseRequest: (id: number) => `/admin/purchase-requests/${id}/reject`,
    
    // Exhibitions
    exhibitions: '/admin/exhibitions',
    allExhibitions: '/admin/exhibitions/all',
    exhibitionDetails: (id: number) => `/admin/exhibitions/${id}`,
    createExhibition: '/admin/exhibitions',
    updateExhibition: (id: number) => `/admin/exhibitions/${id}`,
    deleteExhibition: (id: number) => `/admin/exhibitions/${id}`,
    
    // Analytics
    popularArtworks: '/admin/analytics/popular-artworks',
    popularCategories: '/admin/analytics/popular-categories',
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
