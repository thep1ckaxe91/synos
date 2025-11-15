const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

  // Guest endpoints
  guest = {
    getArtworks: (skip = 0, take = 50) =>
      this.request<any[]>(`/guest/artworks?skip=${skip}&take=${take}`),
    
    getArtworkDetails: (id: number) =>
      this.request<any>(`/guest/artworks/${id}`),
    
    getArtworksByCategory: (categoryId: number, skip = 0, take = 50) =>
      this.request<any[]>(`/guest/categories/${categoryId}/artworks?skip=${skip}&take=${take}`),
    
    getFeaturedArtworks: (count = 10) =>
      this.request<any[]>(`/guest/artworks/featured?count=${count}`),
    
    getRecentArtworks: (count = 10) =>
      this.request<any[]>(`/guest/artworks/recent?count=${count}`),
    
    searchArtworks: (searchRequest: any) =>
      this.request<any>('/guest/artworks/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
      }),
    
    getCategories: () =>
      this.request<any[]>('/guest/categories'),
    
    getCategoryDetails: (id: number) =>
      this.request<any>(`/guest/categories/${id}`),
    
    getExhibitions: (skip = 0, take = 50) =>
      this.request<any[]>(`/guest/exhibitions?skip=${skip}&take=${take}`),
    
    getExhibitionDetails: (id: number) =>
      this.request<any>(`/guest/exhibitions/${id}`),
    
    getActiveExhibitions: () =>
      this.request<any[]>('/guest/exhibitions/active'),
    
    getUpcomingExhibitions: () =>
      this.request<any[]>('/guest/exhibitions/upcoming'),
    
    getPastExhibitions: () =>
      this.request<any[]>('/guest/exhibitions/past'),
    
    getExhibitionArtworks: (id: number) =>
      this.request<any[]>(`/guest/exhibitions/${id}/artworks`),
    
    getActiveAuctions: (skip = 0, take = 50) =>
      this.request<any[]>(`/guest/auctions?skip=${skip}&take=${take}`),
    
    getAuctionDetails: (artworkId: number) =>
      this.request<any>(`/guest/auctions/${artworkId}`),
    
    getStatistics: () =>
      this.request<any>('/guest/statistics'),
    
    getRelatedArtworks: (artworkId: number, count = 5) =>
      this.request<any[]>(`/guest/artworks/${artworkId}/related?count=${count}`),
  };

  // Auth endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<any>('/members/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    register: (data: any) =>
      this.request<any>('/members/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getMe: (token: string) =>
      this.request<any>('/members/me', {}, token),
    
    logout: (id: number, token: string) =>
      this.request<any>(`/members/logout/${id}`, {
        method: 'POST',
      }, token),
  };

  // Member endpoints
  members = {
    getProfile: (id: number, token: string) =>
      this.request<any>(`/members/profile/${id}`, {}, token),
    
    updateProfile: (id: number, data: any, token: string) =>
      this.request<any>(`/members/profile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token),
    
    changePassword: (id: number, data: any, token: string) =>
      this.request<any>(`/members/change-password/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
    
    getMyGallery: (token: string) =>
      this.request<any[]>('/members/me/gallery', {}, token),
    
    getMyFavorites: (token: string) =>
      this.request<any[]>('/members/me/favorites', {}, token),
    
    addToFavorites: (artworkId: number, token: string) =>
      this.request<any>('/members/me/favorites', {
        method: 'POST',
        body: JSON.stringify({ artworkId }),
      }, token),
    
    removeFromFavorites: (artworkId: number, token: string) =>
      this.request<any>(`/members/me/favorites/${artworkId}`, {
        method: 'DELETE',
      }, token),
    
    checkFavorite: (artworkId: number, token: string) =>
      this.request<{ artworkId: number; isFavorite: boolean }>(`/members/me/favorites/${artworkId}/check`, {}, token),
  };

  // Buyer endpoints
  buyer = {
    getOrders: (token: string) =>
      this.request<any[]>('/buyer/orders', {}, token),
    
    placeOrder: (data: { artworkId: number }, token: string) =>
      this.request<any>('/buyer/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
    
    initiatePayment: (orderId: number, token: string) =>
      this.request<{ paymentUrl: string }>(`/buyer/orders/${orderId}/pay`, {
        method: 'POST',
      }, token),
    
    getActiveAuctions: (token: string) =>
      this.request<any[]>('/buyer/auctions', {}, token),
    
    getAuctionDetails: (id: number, token: string) =>
      this.request<any>(`/buyer/auctions/${id}`, {}, token),
    
    placeBid: (auctionId: number, amount: number, token: string) =>
      this.request<any>(`/buyer/auctions/${auctionId}/bids`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }, token),
  };

  // Seller endpoints
  seller = {
    getArtworks: (token: string) =>
      this.request<any[]>('/seller/artworks', {}, token),
    
    uploadArtwork: async (formData: FormData, token: string) => {
      const url = `${this.baseUrl}/seller/artworks`;
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message);
      }

      return await response.json();
    },
    
    getSalesHistory: (token: string) =>
      this.request<any[]>('/seller/sales-history', {}, token),
    
    createAuction: (data: any, token: string) =>
      this.request<any>('/seller/auctions', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
