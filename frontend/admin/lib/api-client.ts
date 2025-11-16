const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(token);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  };

  // Admin endpoints
  admin = {
    // Dashboard
    getDashboardStats: () =>
      this.request<{
        totalMembers: number;
        totalActiveMembers: number;
        totalArtworks: number;
        totalActiveArtworks: number;
        pendingRegistrations: number;
        pendingPurchaseRequests: number;
        totalRevenue: number;
        monthlyRevenue: number;
        totalTransactions: number;
        activeExhibitions: number;
      }>('/api/admin/dashboard'),

    // Members
    getMembers: () =>
      this.request<any[]>('/api/admin/members'),

    approveMember: (id: number) =>
      this.request<any>(`/api/admin/members/${id}/approve`, {
        method: 'POST',
      }),

    rejectMember: (id: number, reason: string) =>
      this.request<any>(`/api/admin/members/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    // Artworks
    getArtworks: () =>
      this.request<any[]>('/api/admin/artworks'),

    approveArtwork: (id: number) =>
      this.request<any>(`/api/admin/artworks/${id}/approve`, {
        method: 'POST',
      }),

    rejectArtwork: (id: number, reason: string) =>
      this.request<any>(`/api/admin/artworks/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    deleteArtwork: (id: number) =>
      this.request<any>(`/api/admin/artworks/${id}`, {
        method: 'DELETE',
      }),

    // Transactions
    getTransactions: () =>
      this.request<any[]>('/api/admin/purchase-requests'),

    approveTransaction: (id: number) =>
      this.request<any>(`/api/admin/purchase-requests/${id}/approve`, {
        method: 'POST',
      }),

    rejectTransaction: (id: number, reason: string) =>
      this.request<any>(`/api/admin/purchase-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    // Exhibitions
    getExhibitions: () =>
      this.request<any[]>('/api/admin/exhibitions'),

    createExhibition: (data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
    }) =>
      this.request<any>('/api/admin/exhibitions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateExhibition: (id: number, data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
    }) =>
      this.request<any>(`/api/admin/exhibitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteExhibition: (id: number) =>
      this.request<any>(`/api/admin/exhibitions/${id}`, {
        method: 'DELETE',
      }),
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
