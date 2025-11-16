// Admin Panel Types
export interface Artwork {
  id: number
  sellerId: number
  title: string
  description?: string
  categoryId?: number
  categoryName?: string
  creationYear?: number
  dimensions?: string
  condition?: string
  isFor: 'FixedPrice' | 'Auction' | 'Both'
  fixedPrice?: number
  currency: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Available' | 'Sold'
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // Additional admin info
  sellerName: string
  sellerEmail: string
  primaryImageUrl?: string
  images: ArtworkImage[]
  totalImages: number
  totalFavorites: number
  totalOrders: number
  seller?: Member
  category?: Category
}

export interface ArtworkImage {
  id: number
  artworkId: number
  imageUrl: string
  isPrimary: boolean
  displayOrder: number
}

export interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface Member {
  id: number
  email: string
  fullName: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  totalOrders: number
  totalSpent: number
  status: string
}

export interface Admin {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface AdminLoginDto {
  username: string
  password: string
}

export interface AuthResultDto {
  token: string
  user: Admin
  expiresAt: string
}

export interface UpdateArtworkStatusDto {
  status: 'Approved' | 'Rejected'
  rejectionReason?: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
}

export interface UpdateCategoryDto {
  name: string
  description?: string
  isActive: boolean
}

export interface Transaction {
  id: number
  userId: number
  userName: string
  userEmail: string
  orderNumber: string
  totalAmount: number
  currency: string
  paymentType: string
  paymentTime: string
  status: number | string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  orderItems?: OrderItem[]
  totalItems?: number
  buyerName?: string
}

export interface OrderItem {
  artworkId: number
  artworkTitle: string
  sellerName: string
  price: number
}

export interface PurchaseRequest {
  id: number
  artwork: string
  buyer: string
  seller: string
  amount: number
  type: string
  date: string
  status: string
}

export interface Exhibition {
  id: number
  title: string
  description: string
  startDate?: string
  endDate?: string
  location: string
  coverImage?: string
  isActive: boolean
  createdAt: string
  deletedAt?: string
  totalArtworks: number
  totalVisitors: number
  status?: string
  artworks?: ExhibitionArtworkDetail[]
  visitors?: number
}

export interface ExhibitionArtworkDetail {
  artworkId: number
  artworkTitle: string
  primaryImageUrl?: string
  displayFrom?: Date | null
  displayTo?: Date | null
}

export interface DashboardStats {
  totalMembers: number
  totalActiveMembers: number
  totalArtworks: number
  totalActiveArtworks: number
  pendingRegistrations: number
  pendingPurchaseRequests: number
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  activeExhibitions: number
  recentActivities: ActivityItem[]
}

export interface ActivityItem {
  activityType: string
  description: string
  timestamp: string
  userName?: string
  relatedEntity?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  status?: number
  details?: any
}
