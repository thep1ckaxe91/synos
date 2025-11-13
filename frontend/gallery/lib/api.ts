const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiError {
  message: string
  status?: number
}

import type {
  GuestArtworkDto,
  GuestArtworkDetailDto,
  GuestCategoryDto,
  GuestExhibitionDto,
  GuestSearchRequestDto,
  GuestSearchResultDto,
  GuestStatisticsDto,
  MemberLoginDto,
  MemberRegisterDto,
  AuthResultDto,
  MemberDto,
  UpdateMemberProfileDto,
  FavoriteDto,
  AddToFavoriteDto,
  OrderResponseDto,
  CreateOrderDto,
  AuctionDetailDto,
  PlaceBidDto,
  VnPayPaymentRequestDto,
  VnPayPaymentResponseDto,
  SellerArtworkDto,
  CreateArtworkDto,
  SalesHistoryDto,
  CreateAuctionDto,
  AuctionResponseDto,
} from "./types"

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token)
      } else {
        localStorage.removeItem("token")
      }
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = {
        message: `API Error: ${response.statusText}`,
        status: response.status,
      }
      throw error
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResultDto> {
    const response = await this.request<AuthResultDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password } as MemberLoginDto),
    })
    if (response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async register(data: MemberRegisterDto): Promise<AuthResultDto> {
    const response = await this.request<AuthResultDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async getCurrentUser(): Promise<MemberDto> {
    return this.request<MemberDto>("/members/me", { method: "GET" })
  }

  async logout() {
    this.setToken(null)
  }

  // Guest/Public endpoints
  async getStatistics(): Promise<GuestStatisticsDto> {
    return this.request<GuestStatisticsDto>("/guest/statistics", { method: "GET" })
  }

  async getArtworks(skip = 0, take = 50): Promise<GuestArtworkDto[]> {
    return this.request<GuestArtworkDto[]>(`/guest/artworks?skip=${skip}&take=${take}`, { method: "GET" })
  }

  async getArtworkDetails(artworkId: number): Promise<GuestArtworkDetailDto> {
    return this.request<GuestArtworkDetailDto>(`/guest/artworks/${artworkId}`, { method: "GET" })
  }

  async getCategories(): Promise<GuestCategoryDto[]> {
    return this.request<GuestCategoryDto[]>("/guest/categories", { method: "GET" })
  }

  async getArtworksByCategory(categoryId: number, skip = 0, take = 50): Promise<GuestArtworkDto[]> {
    return this.request<GuestArtworkDto[]>(`/guest/categories/${categoryId}/artworks?skip=${skip}&take=${take}`, {
      method: "GET",
    })
  }

  async searchArtworks(searchRequest: GuestSearchRequestDto): Promise<GuestSearchResultDto> {
    return this.request<GuestSearchResultDto>("/guest/artworks/search", {
      method: "POST",
      body: JSON.stringify(searchRequest),
    })
  }

  async getExhibitions(skip = 0, take = 50): Promise<GuestExhibitionDto[]> {
    return this.request<GuestExhibitionDto[]>(`/guest/exhibitions?skip=${skip}&take=${take}`, { method: "GET" })
  }

  async getExhibitionDetails(exhibitionId: number): Promise<GuestExhibitionDto> {
    return this.request<GuestExhibitionDto>(`/guest/exhibitions/${exhibitionId}`, { method: "GET" })
  }

  async getActiveExhibitions(): Promise<GuestExhibitionDto[]> {
    return this.request<GuestExhibitionDto[]>("/guest/exhibitions/active", { method: "GET" })
  }

  async getActiveAuctions(skip = 0, take = 50): Promise<GuestArtworkDto[]> {
    return this.request<GuestArtworkDto[]>(`/guest/auctions?skip=${skip}&take=${take}`, { method: "GET" })
  }

  async getAuctionByArtworkId(artworkId: number): Promise<AuctionDetailDto> {
    return this.request<AuctionDetailDto>(`/guest/auctions/${artworkId}`, { method: "GET" })
  }

  // Member endpoints (authenticated)
  async getFavorites(): Promise<FavoriteDto[]> {
    return this.request<FavoriteDto[]>("/members/me/favorites", { method: "GET" })
  }

  async addToFavorites(artworkId: number): Promise<void> {
    return this.request<void>("/members/me/favorites", {
      method: "POST",
      body: JSON.stringify({ artworkId } as AddToFavoriteDto),
    })
  }

  async removeFromFavorites(artworkId: number): Promise<void> {
    return this.request<void>(`/members/me/favorites/${artworkId}`, { method: "DELETE" })
  }

  async checkFavorite(artworkId: number): Promise<{ artworkId: number; isFavorite: boolean }> {
    return this.request<{ artworkId: number; isFavorite: boolean }>(`/members/me/favorites/${artworkId}/check`, {
      method: "GET",
    })
  }

  async updateProfile(data: UpdateMemberProfileDto): Promise<MemberDto> {
    return this.request<MemberDto>("/members/me", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Buyer endpoints
  async getPurchaseHistory(): Promise<OrderResponseDto[]> {
    return this.request<OrderResponseDto[]>("/buyer/orders", { method: "GET" })
  }

  async createOrder(artworkId: number): Promise<OrderResponseDto> {
    return this.request<OrderResponseDto>("/buyer/orders", {
      method: "POST",
      body: JSON.stringify({ artworkId } as CreateOrderDto),
    })
  }

  async getBuyerAuctions(): Promise<AuctionDetailDto[]> {
    return this.request<AuctionDetailDto[]>("/buyer/auctions", { method: "GET" })
  }

  async getBuyerAuctionDetails(auctionId: number): Promise<AuctionDetailDto> {
    return this.request<AuctionDetailDto>(`/buyer/auctions/${auctionId}`, { method: "GET" })
  }

  async placeBid(auctionId: number, amount: number): Promise<void> {
    return this.request<void>(`/buyer/auctions/${auctionId}/bids`, {
      method: "POST",
      body: JSON.stringify({ amount } as PlaceBidDto),
    })
  }

  async createPayment(data: VnPayPaymentRequestDto): Promise<VnPayPaymentResponseDto> {
    return this.request<VnPayPaymentResponseDto>("/buyer/vnpay/create-payment", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Seller endpoints
  async getSellerArtworks(): Promise<SellerArtworkDto[]> {
    return this.request<SellerArtworkDto[]>("/seller/artworks", { method: "GET" })
  }

  async createArtwork(data: CreateArtworkDto): Promise<SellerArtworkDto> {
    return this.request<SellerArtworkDto>("/seller/artworks", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSalesHistory(): Promise<SalesHistoryDto[]> {
    return this.request<SalesHistoryDto[]>("/seller/sales", { method: "GET" })
  }

  async createAuction(data: CreateAuctionDto): Promise<AuctionResponseDto> {
    return this.request<AuctionResponseDto>("/seller/auctions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSellerAuctions(): Promise<AuctionResponseDto[]> {
    return this.request<AuctionResponseDto[]>("/seller/auctions", { method: "GET" })
  }
}

export const apiClient = new ApiClient()
