import { API_CONFIG, API_ENDPOINTS, ApiResponse, PaginatedResponse } from './api-config'
import { ExhibitionArtworkDetail } from './types'

class ApiService {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.headers = { ...API_CONFIG.headers }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    const url = `${this.baseURL}${endpoint}`
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.Message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string; admin: any; success: boolean }> {
    return this.makeRequest(API_ENDPOINTS.admin.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getProfile(): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.profile)
  }

  async getDashboard(): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.dashboard)
  }

  async getRecentActivities(count: number = 10): Promise<any[]> {
    return this.makeRequest(`${API_ENDPOINTS.admin.activities}?count=${count}`)
  }

  // Member methods
  async getMembers(params: {
    skip?: number
    take?: number
    role?: string
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    if (params.role) searchParams.set('role', params.role)
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.members}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getAllMembers(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.admin.allMembers)
  }

  async getMemberDetails(id: number): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.memberDetails(id))
  }

  async approveMember(id: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.approveMember(id), {
      method: 'POST',
    })
  }

  async rejectMember(id: number, reason: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.rejectMember(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Artwork methods
  async getArtworks(params: {
    skip?: number
    take?: number
    status?: string
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    if (params.status) searchParams.set('status', params.status)
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.artworks}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getAllArtworks(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.admin.allArtworks)
  }

  async getPendingArtworks(params: { skip?: number; take?: number } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.pendingArtworks}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getArtworkDetails(id: number): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.artworkDetails(id))
  }

  async approveArtwork(id: number, adminNote?: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.approveArtwork(id), {
      method: 'POST',
      body: adminNote ? JSON.stringify({ adminNote }) : undefined,
    })
  }

  async rejectArtwork(id: number, reason: string, adminNote?: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.rejectArtwork(id), {
      method: 'POST',
      body: JSON.stringify({ reason, adminNote }),
    })
  }

  async updateArtwork(id: number, data: any): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.updateArtwork(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteArtwork(id: number, reason: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.deleteArtwork(id), {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  async updateArtworkStatus(id: number, status: string, adminNote?: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.updateArtworkStatus(id), {
      method: 'PUT',
      body: JSON.stringify({ status, adminNote }),
    })
  }

  // Transaction methods
  async getTransactions(params: {
    skip?: number
    take?: number
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.transactions}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getAllTransactions(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.admin.allTransactions)
  }

  async getTransactionDetails(id: number): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.transactionDetails(id))
  }

  async getTransactionsByDateRange(startDate: string, endDate: string, params: {
    skip?: number
    take?: number
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    searchParams.set('startDate', startDate)
    searchParams.set('endDate', endDate)
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.transactionsByDateRange}?${query}`
    
    return this.makeRequest(endpoint)
  }

  // Purchase Request methods
  async getPurchaseRequests(params: {
    page?: number
    pageSize?: number
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.purchaseRequests}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getAllPurchaseRequests(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.admin.allPurchaseRequests)
  }

  async approvePurchaseRequest(id: number, adminNote?: string, deliveryDate?: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.approvePurchaseRequest(id), {
      method: 'POST',
      body: JSON.stringify({ adminNote, deliveryDate }),
    })
  }

  async rejectPurchaseRequest(id: number, reason: string, adminNote?: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.rejectPurchaseRequest(id), {
      method: 'POST',
      body: JSON.stringify({ reason, adminNote }),
    })
  }

  // Exhibition methods
  async getExhibitions(params: {
    skip?: number
    take?: number
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params.take !== undefined) searchParams.set('take', params.take.toString())
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.admin.exhibitions}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }

  async getAllExhibitions(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.admin.allExhibitions)
  }

  async getExhibitionDetails(id: number): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.exhibitionDetails(id))
  }

  async createExhibition(data: {
    title: string
    description?: string
    location?: string
    startDate?: string
    endDate?: string
    featuredArtworkIds?: number[]
  }): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.createExhibition, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExhibition(id: number, data: {
    title?: string
    description?: string
    location?: string
    startDate?: string
    endDate?: string
  }): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.admin.updateExhibition(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExhibition(id: number, reason: string, removeArtworks: boolean = false): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.deleteExhibition(id), {
      method: 'DELETE',
      body: JSON.stringify({ reason, removeArtworks }),
    })
  }

  async updateExhibitionArtworks(id: number, artworks: ExhibitionArtworkDetail[]): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.updateExhibitionArtworks(id), {
        method: 'PUT',
        body: JSON.stringify({ artworks }),
    });
}

  // Category methods
  async getCategories(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.guest.categories)
  }

  // Statistics methods
  async getStatistics(): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.guest.statistics)
  }

  // Analytics methods
  async getPopularArtworks(count: number = 10): Promise<any[]> {
    return this.makeRequest(`${API_ENDPOINTS.admin.popularArtworks}?count=${count}`)
  }

  async getPopularCategories(count: number = 10): Promise<any[]> {
    return this.makeRequest(`${API_ENDPOINTS.admin.popularCategories}?count=${count}`)
  }
}

export const apiService = new ApiService()
