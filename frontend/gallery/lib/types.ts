// Types matching the C# DTOs from backend

// === GUEST DTOs ===
export interface GuestArtworkImageDto {
  id: number
  imageUrl: string
  isPrimary: boolean
}

export interface GuestArtworkDto {
  id: number
  title: string
  description?: string
  categoryId?: number
  categoryName?: string
  creationYear?: number
  dimensions?: string
  condition?: string
  material?: string
  price?: number
  artworkFor: string // "Auction" or "Fixed"
  status: string
  createdAt: string
  sellerName: string
  images: GuestArtworkImageDto[]
}

export interface GuestAuctionDto {
  id: number
  startTime: string
  endTime: string
  startingPrice: number
  reservePrice?: number
  minimumIncrement: number
  status: string
  currentHighestBid?: number
  bidCount: number
  isActive: boolean
  timeRemaining?: string
}

export interface GuestArtworkDetailDto extends GuestArtworkDto {
  sellerBio?: string
  auctionDetails?: GuestAuctionDto
  relatedArtworks: GuestArtworkDto[]
}

export interface GuestExhibitionDto {
  id: number
  title: string
  description?: string
  location?: string
  startDate?: string
  endDate?: string
  createdAt: string
  status: string // "Upcoming", "Active", "Past"
  artworkCount: number
  featuredArtworks: GuestArtworkDto[]
}

export interface GuestCategoryDto {
  id: number
  name: string
  slug?: string
  description?: string
  artworkCount: number
}

export interface GuestSearchRequestDto {
  keyword?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  artworkFor?: string // "Auction", "Fixed", or null for all
  sortBy?: string // "Title", "Price", "CreatedAt"
  sortOrder?: string // "ASC", "DESC"
  page?: number
  pageSize?: number
}

export interface GuestSearchResultDto {
  totalCount: number
  page: number
  pageSize: number
  artworks: GuestArtworkDto[]
}

export interface GuestStatisticsDto {
  totalArtworks: number
  activeAuctions: number
  activeExhibitions: number
  totalCategories: number
  featuredArtworks: GuestArtworkDto[]
  recentArtworks: GuestArtworkDto[]
}

// === MEMBER DTOs ===
export interface MemberDto {
  id: number
  email: string
  fullName: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
  bio?: string
  profileImage?: string
}

export interface MemberLoginDto {
  email: string
  password: string
}

export interface MemberRegisterDto {
  email: string
  password: string
  fullName: string
  phone?: string
  role?: string
  bio?: string
  profileImage?: string
}

export interface UpdateMemberProfileDto {
  fullName: string
  phone?: string
  bio?: string
  profileImage?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface AuthResultDto {
  success: boolean
  message: string
  member?: MemberDto
  token?: string
}

export interface FavoriteDto {
  artworkId: number
  artworkTitle: string
  artworkDescription?: string
  fixedPrice?: number
  artworkFor: string // "Fixed" or "Auction"
  status: string
  primaryImage?: string
  sellerName: string
  categoryName: string
  addedToFavoritesAt: string
}

export interface AddToFavoriteDto {
  artworkId: number
}

// === BUYER DTOs ===
export interface CreateOrderDto {
  artworkId: number
}

export interface OrderItemDto {
  id: number
  artworkId: number
  total: number
  artworkTitle: string
  artworkImageUrl: string
}

export interface OrderResponseDto {
  id: number
  orderNumber: string
  totalAmount: number
  currency: string
  paymentType: string
  status: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItemDto[]
}

export interface AuctionSellerDto {
  id: number
  fullName: string
  bio?: string
  profileImage?: string
}

export interface AuctionArtworkDto {
  id: number
  title: string
  description: string
  creationYear: number
  dimensions: string
  condition: string
  currency: string
  status: string
  seller: AuctionSellerDto
  artworkImages: GuestArtworkImageDto[]
  categoryName: string
}

export interface AuctionDetailDto {
  id: number
  artworkId: number
  startTime: string
  endTime: string
  startingPrice: number
  reservePrice?: number
  minimumIncrement: number
  status: string
  winnerBidId?: number
  createdAt: string
  artwork: AuctionArtworkDto
  totalBids: number
  currentHighestBid?: number
}

export interface PlaceBidDto {
  amount: number
}

export interface VnPayPaymentRequestDto {
  orderId: number
  orderInfo: string
  amount: number
}

export interface VnPayPaymentResponseDto {
  isSuccess: boolean
  paymentUrl: string
  message: string
}

// === SELLER DTOs ===
export enum SaleTypeDto {
  FixedPrice = "FixedPrice",
  Auction = "Auction",
}

export interface CreateArtworkDto {
  title: string
  description?: string
  price: number
  saleType: SaleTypeDto
  categoryId: number
  creationYear?: number
  dimensions?: string
  condition?: string
  currency?: string
}

export interface SellerArtworkDto {
  id: number
  title: string
  description?: string
  price: number
  saleType: string
  status: string
  primaryImage?: string
  images: GuestArtworkImageDto[]
  createdAt: string
  categoryName: string
}

export interface SalesHistoryDto {
  orderId: number
  artworkTitle: string
  primaryImage?: string
  soldAt: string
  salePrice: number
  commissionAmount: number
  payoutAmount: number
  buyerName: string
}

export interface CreateAuctionDto {
  artworkId: number
  startingPrice: number
  startTime: string
  endTime: string
  reservePrice?: number
}

export interface AuctionResponseDto {
  id: number
  artworkId: number
  artworkTitle: string
  startTime: string
  endTime: string
  startingPrice: number
  reservePrice?: number
  minimumIncrement: number
  status: string
  winnerBidId?: number
  createdAt: string
}
