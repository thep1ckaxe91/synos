using Synos.Api.Models;

namespace Synos.Api.DTOs
{
    // === AUTHENTICATION DTOs ===
    public class AdminLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AdminDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class AdminAuthResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public AdminDto? Admin { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    // === MEMBER MANAGEMENT DTOs ===
    public class MemberRegistrationRequestDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Computed Status Property
        public string Status
        {
            get
            {
                if (DeletedAt.HasValue && !IsActive)
                    return "Rejected"; // Rejected: IsActive = false AND DeletedAt = rejection time
                if (!IsActive && !DeletedAt.HasValue)
                    return "Pending"; // Pending: IsActive = false AND DeletedAt = null
                if (IsActive && !DeletedAt.HasValue)
                    return "Approved"; // Approved/Active: IsActive = true AND DeletedAt = null
                return "Unknown"; // Fallback for unexpected states
            }
        }
    }

    public class ApproveMemberRequestDto
    {
        public long MemberId { get; set; }
        public string? AdminNote { get; set; }
        // When approved: IsActive = true, DeletedAt = null
    }

    public class RejectMemberRequestDto
    {
        public long MemberId { get; set; }
        public string Reason { get; set; } = string.Empty;
        // When rejected: IsActive = false, DeletedAt = TimeUtils.GetCurrentTime()
    }

    public class AdminMemberViewDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public MemberRole Role { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        
        // Computed Status Property
        public string Status
        {
            get
            {
                if (DeletedAt.HasValue && !IsActive)
                    return "Rejected"; // Rejected: IsActive = false AND DeletedAt = rejection time
                if (!IsActive && !DeletedAt.HasValue)
                    return "Pending"; // Pending: IsActive = false AND DeletedAt = null
                if (IsActive && !DeletedAt.HasValue)
                    return "Approved"; // Approved/Active: IsActive = true AND DeletedAt = null
                return "Unknown"; // Fallback for unexpected states
            }
        }
    }

    // === ARTWORK MANAGEMENT DTOs ===
    public class AdminArtworkViewDto
    {
        public long Id { get; set; }
        public long SellerId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public short? CreationYear { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public ArtworkFor IsFor { get; set; }
        public decimal? FixedPrice { get; set; }
        public string Currency { get; set; } = "USD";
        public ArtworkStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Additional info for admin view
        public string SellerName { get; set; } = string.Empty;
        public string SellerEmail { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public List<ArtworkImageDto> Images { get; set; } = new List<ArtworkImageDto>();
        public int TotalImages { get; set; }
        public int TotalFavorites { get; set; }
        public int TotalOrders { get; set; }
    }

    public class ArtworkImageDto
    {
        public long Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class UpdateArtworkDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public short? CreationYear { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public ArtworkFor? IsFor { get; set; }
        public decimal? FixedPrice { get; set; }
        public string? Currency { get; set; }
        public ArtworkStatus? Status { get; set; }
        public string? AdminNote { get; set; }
    }

    public class DeleteArtworkDto
    {
        public string Reason { get; set; } = string.Empty;
        public bool PermanentDelete { get; set; } = false;
    }

    // === ORDER/PURCHASE MANAGEMENT DTOs ===
    public class AdminOrderViewDto
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentType { get; set; } = string.Empty;
        public DateTime PaymentTime { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public List<OrderItemInfoDto> OrderItems { get; set; } = new();
    }

    public class UpdateOrderStatusDto
    {
        public long OrderId { get; set; }
        public OrderStatus Status { get; set; }
        public string? AdminNote { get; set; }
    }

    // === TRANSACTION MONITORING DTOs ===
    public class TransactionMonitorDto
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentType { get; set; } = string.Empty;
        public DateTime PaymentTime { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Additional order items info
        public List<OrderItemInfoDto> OrderItems { get; set; } = new();
        public int TotalItems { get; set; }
    }

    public class OrderItemInfoDto
    {
        public long ArtworkId { get; set; }
        public string ArtworkTitle { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class TransactionFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? TransactionType { get; set; }
        public string? Status { get; set; }
        public long? UserId { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // === EXHIBITION MANAGEMENT DTOs ===
    public class CreateExhibitionDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<long>? FeaturedArtworkIds { get; set; }
    }

    public class UpdateExhibitionDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class AdminExhibitionViewDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? CoverImage { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int TotalArtworks { get; set; }
        public int TotalVisitors { get; set; }
        public List<ExhibitionArtworkDetailDto> Artworks { get; set; } = new List<ExhibitionArtworkDetailDto>();
    }

    public class ExhibitionArtworkManageDto
    {
        public long ExhibitionId { get; set; }
        public long ArtworkId { get; set; }
        public int? DisplayOrder { get; set; }
        public string? DisplayNote { get; set; }
    }

    public class DeleteExhibitionDto
    {
        public string Reason { get; set; } = string.Empty;
        public bool RemoveArtworks { get; set; } = false;
    }

    public class UpdateExhibitionArtworksDto
    {
        public IEnumerable<ExhibitionArtworkDto> Artworks { get; set; } = new List<ExhibitionArtworkDto>();
    }

    public class ExhibitionArtworkDto
    {
        public long ArtworkId { get; set; }
        public DateTime? DisplayFrom { get; set; }
        public DateTime? DisplayTo { get; set; }
    }

    public class ExhibitionArtworkDetailDto
    {
        public long ArtworkId { get; set; }
        public string ArtworkTitle { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public DateTime? DisplayFrom { get; set; }
        public DateTime? DisplayTo { get; set; }
    }

    // === CATEGORY MANAGEMENT DTOs ===
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ArtworkCount { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
    }

    // === SELLER MANAGEMENT DTOs ===
    public class AdminSellerViewDto
    {
        public long Id { get; set; }
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public string? Address { get; set; }
        public string? ProfileImage { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Member info
        public string MemberName { get; set; } = string.Empty;
        public string MemberEmail { get; set; } = string.Empty;
        public MemberRole MemberRole { get; set; }
        public bool MemberIsActive { get; set; }
        
        // Statistics
        public int TotalArtworks { get; set; }
        public int SoldArtworks { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal AverageArtworkPrice { get; set; }
    }

    // === DASHBOARD & ANALYTICS DTOs ===
    public class AdminDashboardDto
    {
        public int TotalMembers { get; set; }
        public int TotalActiveMembers { get; set; }
        public int TotalArtworks { get; set; }
        public int TotalActiveArtworks { get; set; }
        public int PendingRegistrations { get; set; }
        public int PendingPurchaseRequests { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int TotalTransactions { get; set; }
        public int ActiveExhibitions { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? UserName { get; set; }
        public string? RelatedEntity { get; set; }
    }

    // === SYSTEM MANAGEMENT DTOs ===
    public class SystemSettingsDto
    {
        public decimal CommissionRate { get; set; }
        public bool RegistrationRequiresApproval { get; set; }
        public bool PurchaseRequiresApproval { get; set; }
        public int MaxFileUploadSize { get; set; }
        public string[] AllowedImageFormats { get; set; } = Array.Empty<string>();
        public string SystemMaintenanceMessage { get; set; } = string.Empty;
        public bool SystemMaintenanceMode { get; set; }
    }

    // === RESPONSE DTOs ===
    public class AdminActionResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    public class PaginatedResultDto<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => PageNumber < TotalPages;
        public bool HasPreviousPage => PageNumber > 1;
    }

    // === ADDITIONAL ADMIN ACTION DTOs ===
    public class RejectMemberDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateArtworkStatusDto
    {
        public ArtworkStatus Status { get; set; }
        public string? AdminNote { get; set; }
    }

    public class UpdateAdminDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? NewPassword { get; set; }
    }

    // === ENHANCED ARTWORK MANAGEMENT DTOs ===
    public class UpdateArtworkAdminDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public string? Currency { get; set; }
        public ArtworkStatus? Status { get; set; }
        public string? AdminNote { get; set; }
    }

    // === PURCHASE REQUEST MANAGEMENT DTOs ===
    public class ApprovePurchaseDto
    {
        public string? AdminNote { get; set; }
        public DateTime? DeliveryDate { get; set; }
    }

    public class RejectPurchaseDto
    {
        public string Reason { get; set; } = string.Empty;
        public string? AdminNote { get; set; }
    }

    // === ARTWORK APPROVAL DTOs ===
    public class ApproveArtworkDto
    {
        public string? AdminNote { get; set; }
    }

    public class RejectArtworkDto
    {
        public string Reason { get; set; } = string.Empty;
        public string? AdminNote { get; set; }
    }
}
