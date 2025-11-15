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
  isFor: 'FixedPrice' | 'Auction'
  fixedPrice?: number
  currency: string
  status: 'Pending' | 'Approved' | 'Rejected'
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
  id: number
  type: 'artwork_submitted' | 'artwork_approved' | 'artwork_rejected' | 'member_registered'
  title: string
  description: string
  createdAt: string
  relatedId?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
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
  status: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  orderItems: OrderItem[]
  totalItems: number
  buyerName: string
  buyerEmail?: string
}

export interface OrderItem {
  id: number
  artworkId: number
  artworkTitle: string
  artworkImage?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ApiError {
  message: string
  status?: number
  details?: any
}