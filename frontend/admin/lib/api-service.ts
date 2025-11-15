import { API_CONFIG, API_ENDPOINTS, ApiResponse, PaginatedResponse } from './api-config'

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
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
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
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.makeRequest(API_ENDPOINTS.admin.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    return this.makeRequest(API_ENDPOINTS.auth.validate, {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async getCurrentUser(): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.auth.me)
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

  async getArtworkById(id: number): Promise<any> {
    return this.makeRequest(`${API_ENDPOINTS.admin.artworks}/${id}`)
  }

  async approveArtwork(id: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.approve(id), {
      method: 'POST',
    })
  }

  async rejectArtwork(id: number, reason: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.admin.reject(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
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

  // Category methods
  async getCategories(): Promise<any[]> {
    return this.makeRequest(API_ENDPOINTS.guest.categories)
  }

  // Statistics methods
  async getStatistics(): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.guest.statistics)
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
    const endpoint = `${API_ENDPOINTS.guest.exhibitions}${query ? `?${query}` : ''}`
    
    return this.makeRequest(endpoint)
  }
}

export const apiService = new ApiService()