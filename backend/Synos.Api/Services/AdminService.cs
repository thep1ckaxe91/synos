using Synos.Api.Models;
using Synos.Api.DTOs;
using Synos.Api.Repositories;
using Synos.Api.Utils;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Synos.Api.Services
{
    public interface IAdminService
    {
        // Authentication
        Task<AdminAuthResultDto> LoginAsync(AdminLoginDto loginDto);
        Task<AdminDto?> GetAdminProfileAsync(long adminId);
        Task<AdminDto?> UpdateAdminProfileAsync(long adminId, UpdateAdminDto updateDto);
        
        // Member Management
        Task<IEnumerable<AdminMemberViewDto>> GetMembersForAdminAsync(int skip = 0, int take = 50);
        Task<AdminMemberViewDto?> GetMemberDetailsForAdminAsync(long memberId);
        Task<bool> ApproveMemberAsync(long adminId, long memberId);
        Task<bool> RejectMemberAsync(long adminId, long memberId);
        
        // Artwork Management
        Task<IEnumerable<AdminArtworkViewDto>> GetArtworksForAdminAsync(int skip = 0, int take = 50);
        Task<AdminArtworkViewDto?> GetArtworkDetailsForAdminAsync(long artworkId);
        Task<bool> UpdateArtworkStatusAsync(long adminId, long artworkId, ArtworkStatus status);
        Task<bool> DeleteArtworkAsync(long adminId, long artworkId);
        Task<bool> ApproveArtworkAsync(long adminId, long artworkId, string? adminNote);
        Task<bool> RejectArtworkAsync(long adminId, long artworkId, string reason, string? adminNote);
        Task<IEnumerable<AdminArtworkViewDto>> GetPendingArtworksAsync(int skip = 0, int take = 50);
        
        // Transaction Management
        Task<IEnumerable<TransactionMonitorDto>> GetTransactionsForAdminAsync(int skip = 0, int take = 50);
        Task<TransactionMonitorDto?> GetTransactionDetailsAsync(long orderId);
        Task<IEnumerable<TransactionMonitorDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 50);
        
        // Exhibition Management
        Task<IEnumerable<AdminExhibitionViewDto>> GetExhibitionsForAdminAsync(int skip = 0, int take = 50);
        Task<AdminExhibitionViewDto?> GetExhibitionDetailsForAdminAsync(long exhibitionId);
        
        // Dashboard & Analytics
        Task<AdminDashboardDto> GetDashboardAsync();
        Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10);
        Task<IEnumerable<AdminArtworkViewDto>> GetMostViewedArtworksAsync(int count = 10);
        Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(int count = 10);

        // Non-Paginated Methods
        Task<IEnumerable<AdminMemberViewDto>> GetAllMembersAsync();
        Task<IEnumerable<AdminArtworkViewDto>> GetAllArtworksAsync();
        Task<IEnumerable<AdminOrderViewDto>> GetAllTransactionsAsync();
        Task<IEnumerable<AdminExhibitionViewDto>> GetAllExhibitionsAsync();

        // Exhibition CRUD
        Task<AdminExhibitionViewDto> CreateExhibitionAsync(CreateExhibitionDto dto);
        Task<AdminExhibitionViewDto?> UpdateExhibitionAsync(long exhibitionId, UpdateExhibitionDto dto);
        Task<bool> DeleteExhibitionAsync(long exhibitionId, DeleteExhibitionDto dto);

        // Artwork Full Management
        Task<AdminArtworkViewDto?> UpdateArtworkAsync(long artworkId, UpdateArtworkAdminDto dto);

        // Purchase Request Management
        Task<IEnumerable<AdminOrderViewDto>> GetPendingPurchaseRequestsAsync(int page, int pageSize);
        Task<IEnumerable<AdminOrderViewDto>> GetAllPendingPurchaseRequestsAsync();
        Task<bool> ApprovePurchaseRequestAsync(long orderId, ApprovePurchaseDto dto);
        Task<bool> RejectPurchaseRequestAsync(long orderId, RejectPurchaseDto dto);
    }

    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _adminRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IArtworkRepository _artworkRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IExhibitionRepository _exhibitionRepository;
        private readonly IJwtService _jwtService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AdminService(
            IAdminRepository adminRepository,
            IMemberRepository memberRepository,
            IArtworkRepository artworkRepository,
            IOrderRepository orderRepository,
            IExhibitionRepository exhibitionRepository,
            IJwtService jwtService,
            IHttpContextAccessor httpContextAccessor)
        {
            _adminRepository = adminRepository;
            _memberRepository = memberRepository;
            _artworkRepository = artworkRepository;
            _orderRepository = orderRepository;
            _exhibitionRepository = exhibitionRepository;
            _jwtService = jwtService;
            _httpContextAccessor = httpContextAccessor;
        }

        // ===========================================
        // HELPER METHODS
        // ===========================================

        private string GetBaseUrl()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return "http://localhost:8080"; // Fallback for Docker environment

            return $"{request.Scheme}://{request.Host}";
        }

        private AdminArtworkViewDto ProcessArtworkImages(AdminArtworkViewDto artwork)
        {
            var baseUrl = GetBaseUrl();
            
            // Convert primary image file path to full URL
            if (!string.IsNullOrEmpty(artwork.PrimaryImageUrl))
            {
                var normalizedPath = artwork.PrimaryImageUrl.Replace("\\", "/");
                if (normalizedPath.StartsWith("uploads/"))
                {
                    artwork.PrimaryImageUrl = $"{baseUrl}/{normalizedPath}";
                }
                else
                {
                    artwork.PrimaryImageUrl = $"{baseUrl}/uploads/{normalizedPath}";
                }
            }

            // Convert all image file paths to full URLs
            foreach (var image in artwork.Images)
            {
                if (!string.IsNullOrEmpty(image.ImageUrl))
                {
                    var normalizedPath = image.ImageUrl.Replace("\\", "/");
                    if (normalizedPath.StartsWith("uploads/"))
                    {
                        image.ImageUrl = $"{baseUrl}/{normalizedPath}";
                    }
                    else
                    {
                        image.ImageUrl = $"{baseUrl}/uploads/{normalizedPath}";
                    }
                }
            }

            return artwork;
        }

        private IEnumerable<AdminArtworkViewDto> ProcessArtworkImagesList(IEnumerable<AdminArtworkViewDto> artworks)
        {
            return artworks.Select(ProcessArtworkImages);
        }

        // ===========================================
        // AUTHENTICATION
        // ===========================================

        public async Task<AdminAuthResultDto> LoginAsync(AdminLoginDto loginDto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return new AdminAuthResultDto
                    {
                        Success = false,
                        Message = "Email and password are required"
                    };
                }

                // Get admin by email
                var admin = await _adminRepository.GetAdminByEmailAsync(loginDto.Email);
                if (admin == null)
                {
                    return new AdminAuthResultDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                // Verify password
                var hashedPassword = HashPassword(loginDto.Password);
                if (admin.PasswordHash != hashedPassword)
                {
                    return new AdminAuthResultDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                // Check if admin is active
                if (admin.DeletedAt.HasValue)
                {
                    return new AdminAuthResultDto
                    {
                        Success = false,
                        Message = "Admin account is deactivated"
                    };
                }

                // Generate JWT token
                var token = _jwtService.GenerateAdminToken(admin);

                return new AdminAuthResultDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    Admin = new AdminDto
                    {
                        Id = admin.Id,
                        Email = admin.Email,
                        FullName = admin.FullName,

                        Phone = admin.Phone,
                        IsActive = admin.IsActive,
                        CreatedAt = admin.CreatedAt,
                        UpdatedAt = admin.UpdatedAt,
                        DeletedAt = admin.DeletedAt
                    }
                };
            }
            catch (Exception)
            {
                return new AdminAuthResultDto
                {
                    Success = false,
                    Message = "An error occurred during login"
                };
            }
        }

        public async Task<AdminDto?> GetAdminProfileAsync(long adminId)
        {
            var admin = await _adminRepository.GetAdminByIdAsync(adminId);
            if (admin == null || admin.DeletedAt.HasValue)
                return null;

            return new AdminDto
            {
                Id = admin.Id,
                Email = admin.Email,
                FullName = admin.FullName,

                Phone = admin.Phone,
                IsActive = admin.IsActive,
                CreatedAt = admin.CreatedAt,
                UpdatedAt = admin.UpdatedAt,
                DeletedAt = admin.DeletedAt
            };
        }

        public async Task<AdminDto?> UpdateAdminProfileAsync(long adminId, UpdateAdminDto updateDto)
        {
            var admin = await _adminRepository.GetAdminByIdAsync(adminId);
            if (admin == null || admin.DeletedAt.HasValue)
                return null;

            admin.FullName = updateDto.FullName ?? admin.FullName;
            admin.Phone = updateDto.Phone ?? admin.Phone;
            admin.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            // Update password if provided
            if (!string.IsNullOrEmpty(updateDto.NewPassword))
            {
                admin.PasswordHash = HashPassword(updateDto.NewPassword);
            }

            var updatedAdmin = await _adminRepository.UpdateAdminAsync(adminId, admin);
            if (updatedAdmin == null)
                return null;

            return new AdminDto
            {
                Id = updatedAdmin.Id,
                Email = updatedAdmin.Email,
                FullName = updatedAdmin.FullName,

                Phone = updatedAdmin.Phone,
                IsActive = updatedAdmin.IsActive,
                CreatedAt = updatedAdmin.CreatedAt,
                UpdatedAt = updatedAdmin.UpdatedAt,
                DeletedAt = updatedAdmin.DeletedAt
            };
        }

        // ===========================================
        // MEMBER MANAGEMENT
        // ===========================================

        public async Task<IEnumerable<AdminMemberViewDto>> GetMembersForAdminAsync(int skip = 0, int take = 50)
        {
            return await _adminRepository.GetMembersForAdminAsync(skip, take);
        }

        public async Task<AdminMemberViewDto?> GetMemberDetailsForAdminAsync(long memberId)
        {
            return await _adminRepository.GetMemberDetailsForAdminAsync(memberId);
        }

        public async Task<bool> ApproveMemberAsync(long adminId, long memberId)
        {
            try
            {
                var member = await _memberRepository.GetMemberByIdAsync(memberId);
                if (member == null)
                    return false;

                // Validate current status
                if (member.IsActive || member.DeletedAt.HasValue)
                    throw new InvalidOperationException("Member is not in pending status");

                // Approve member
                member.IsActive = true;
                member.UpdatedAt = TimeUtils.GetUpdateTimestamp();

                var updatedMember = await _memberRepository.UpdateMemberAsync(memberId, member);
                return updatedMember != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> RejectMemberAsync(long adminId, long memberId)
        {
            try
            {
                var member = await _memberRepository.GetMemberByIdAsync(memberId);
                if (member == null)
                    return false;

                // Validate current status
                if (member.IsActive || member.DeletedAt.HasValue)
                    throw new InvalidOperationException("Member is not in pending status");

                // Use repository delete method (soft delete)
                return await _memberRepository.DeleteMemberAsync(memberId);
            }
            catch (Exception)
            {
                return false;
            }
        }

        // ===========================================
        // ARTWORK MANAGEMENT
        // ===========================================

        public async Task<IEnumerable<AdminArtworkViewDto>> GetArtworksForAdminAsync(int skip = 0, int take = 50)
        {
            var artworks = await _adminRepository.GetArtworksForAdminAsync(skip, take);
            return ProcessArtworkImagesList(artworks);
        }

        public async Task<AdminArtworkViewDto?> GetArtworkDetailsForAdminAsync(long artworkId)
        {
            var artwork = await _adminRepository.GetArtworkDetailsForAdminAsync(artworkId);
            return artwork != null ? ProcessArtworkImages(artwork) : null;
        }

        public async Task<bool> UpdateArtworkStatusAsync(long adminId, long artworkId, ArtworkStatus status)
        {
            try
            {
                // Get the artwork first to verify it exists
                var artwork = await _artworkRepository.GetArtworkByIdAsync(artworkId);
                if (artwork == null)
                {
                    return false;
                }

                // Update the status and timestamp
                artwork.Status = status;
                artwork.UpdatedAt = TimeUtils.GetCurrentTime();

                // Save the changes
                var updatedArtwork = await _artworkRepository.UpdateArtworkAsync(artworkId, artwork);
                return updatedArtwork != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteArtworkAsync(long adminId, long artworkId)
        {
            try
            {
                // Use the repository's delete method (soft delete)
                var result = await _artworkRepository.DeleteArtworkAsync(artworkId);
                return result;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> ApproveArtworkAsync(long adminId, long artworkId, string? adminNote)
        {
            try
            {
                // Get the artwork first to verify it exists and is pending
                var artwork = await _artworkRepository.GetArtworkByIdAsync(artworkId);
                if (artwork == null || artwork.Status != ArtworkStatus.Pending)
                {
                    return false;
                }

                // Update the status to Available and set timestamp
                artwork.Status = ArtworkStatus.Available;
                artwork.UpdatedAt = TimeUtils.GetCurrentTime();

                // Save the changes
                var updatedArtwork = await _artworkRepository.UpdateArtworkAsync(artworkId, artwork);
                return updatedArtwork != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> RejectArtworkAsync(long adminId, long artworkId, string reason, string? adminNote)
        {
            try
            {
                // Get the artwork first to verify it exists and is pending
                var artwork = await _artworkRepository.GetArtworkByIdAsync(artworkId);
                if (artwork == null || artwork.Status != ArtworkStatus.Pending)
                {
                    return false;
                }

                // Soft delete the artwork (reject by setting DeletedAt)
                artwork.DeletedAt = TimeUtils.GetCurrentTime();
                artwork.UpdatedAt = TimeUtils.GetCurrentTime();

                // Save the changes
                var updatedArtwork = await _artworkRepository.UpdateArtworkAsync(artworkId, artwork);
                return updatedArtwork != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<IEnumerable<AdminArtworkViewDto>> GetPendingArtworksAsync(int skip = 0, int take = 50)
        {
            try
            {
                // Get artworks with Pending status
                var pendingArtworks = await _artworkRepository.GetArtworksByStatusAsync(ArtworkStatus.Pending);
                
                // Apply pagination
                var paginatedArtworks = pendingArtworks.Skip(skip).Take(take);
                
                // Convert to AdminArtworkViewDto
                var result = new List<AdminArtworkViewDto>();
                foreach (var artwork in paginatedArtworks)
                {
                    var dto = new AdminArtworkViewDto
                    {
                        Id = artwork.Id,
                        SellerId = artwork.SellerId,
                        Title = artwork.Title,
                        Description = artwork.Description,
                        CategoryId = artwork.CategoryId,
                        CreationYear = artwork.CreationYear,
                        Dimensions = artwork.Dimensions,
                        Condition = artwork.Condition,
                        IsFor = artwork.IsFor,
                        FixedPrice = artwork.FixedPrice,
                        Currency = artwork.Currency,
                        Status = artwork.Status,
                        CreatedAt = artwork.CreatedAt,
                        UpdatedAt = artwork.UpdatedAt,
                        DeletedAt = artwork.DeletedAt,
                        // Additional seller info would need to be populated from Member repository
                        SellerName = "Seller Name", // TODO: Get from member repository
                        SellerEmail = "seller@example.com", // TODO: Get from member repository
                        TotalImages = 0, // TODO: Get from artwork images
                        TotalFavorites = 0, // TODO: Get from favorites
                        TotalOrders = 0 // TODO: Get from orders
                    };
                    result.Add(dto);
                }
                
                return result;
            }
            catch (Exception)
            {
                return new List<AdminArtworkViewDto>();
            }
        }

        // ===========================================
        // TRANSACTION MANAGEMENT
        // ===========================================

        public async Task<IEnumerable<TransactionMonitorDto>> GetTransactionsForAdminAsync(int skip = 0, int take = 50)
        {
            return await _adminRepository.GetTransactionsForAdminAsync(skip, take);
        }

        public async Task<TransactionMonitorDto?> GetTransactionDetailsAsync(long orderId)
        {
            return await _adminRepository.GetTransactionDetailsForAdminAsync(orderId);
        }

        public async Task<IEnumerable<TransactionMonitorDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 50)
        {
            return await _adminRepository.GetTransactionsByDateRangeAsync(startDate, endDate, skip, take);
        }

        // ===========================================
        // EXHIBITION MANAGEMENT
        // ===========================================

        public async Task<IEnumerable<AdminExhibitionViewDto>> GetExhibitionsForAdminAsync(int skip = 0, int take = 50)
        {
            return await _adminRepository.GetExhibitionsForAdminAsync(skip, take);
        }

        public async Task<AdminExhibitionViewDto?> GetExhibitionDetailsForAdminAsync(long exhibitionId)
        {
            return await _adminRepository.GetExhibitionDetailsForAdminAsync(exhibitionId);
        }

        // ===========================================
        // DASHBOARD & ANALYTICS
        // ===========================================

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            return await _adminRepository.GetDashboardStatsAsync();
        }

        public async Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10)
        {
            return await _adminRepository.GetRecentActivitiesAsync(count);
        }

        public async Task<IEnumerable<AdminArtworkViewDto>> GetMostViewedArtworksAsync(int count = 10)
        {
            var artworks = await _adminRepository.GetMostViewedArtworksAsync(count);
            return ProcessArtworkImagesList(artworks);
        }

        public async Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(int count = 10)
        {
            return await _adminRepository.GetMostPopularCategoriesAsync(count);
        }

        // ===========================================
        // NON-PAGINATED METHODS
        // ===========================================

        public async Task<IEnumerable<AdminMemberViewDto>> GetAllMembersAsync()
        {
            return await _adminRepository.GetMembersForAdminAsync(0, int.MaxValue);
        }

        public async Task<IEnumerable<AdminArtworkViewDto>> GetAllArtworksAsync()
        {
            var artworks = await _adminRepository.GetArtworksForAdminAsync(0, int.MaxValue);
            return ProcessArtworkImagesList(artworks);
        }

        public async Task<IEnumerable<AdminOrderViewDto>> GetAllTransactionsAsync()
        {
            var transactions = await _adminRepository.GetTransactionsForAdminAsync(0, int.MaxValue);
            // Convert TransactionMonitorDto to AdminOrderViewDto
            return transactions.Select(t => new AdminOrderViewDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.UserName,
                UserEmail = t.UserEmail,
                OrderNumber = t.OrderNumber,
                TotalAmount = t.TotalAmount,
                Currency = t.Currency,
                PaymentType = t.PaymentType,
                PaymentTime = t.PaymentTime,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                DeletedAt = t.DeletedAt,
                OrderItems = t.OrderItems
            });
        }

        public async Task<IEnumerable<AdminExhibitionViewDto>> GetAllExhibitionsAsync()
        {
            return await _adminRepository.GetExhibitionsForAdminAsync(0, int.MaxValue);
        }

        // ===========================================
        // EXHIBITION CRUD
        // ===========================================

        public async Task<AdminExhibitionViewDto> CreateExhibitionAsync(CreateExhibitionDto dto)
        {
            var exhibition = new Exhibition
            {
                Title = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedAt = TimeUtils.GetCurrentTime()
            };

            var createdExhibition = await _exhibitionRepository.CreateExhibitionAsync(exhibition);
            
            return new AdminExhibitionViewDto
            {
                Id = createdExhibition.Id,
                Title = createdExhibition.Title,
                Description = createdExhibition.Description ?? string.Empty,
                Location = createdExhibition.Location ?? string.Empty,
                StartDate = createdExhibition.StartDate,
                EndDate = createdExhibition.EndDate,
                CreatedAt = createdExhibition.CreatedAt,
                DeletedAt = createdExhibition.DeletedAt,
                TotalArtworks = 0,
                TotalVisitors = 0
            };
        }

        public async Task<AdminExhibitionViewDto?> UpdateExhibitionAsync(long exhibitionId, UpdateExhibitionDto dto)
        {
            var exhibition = await _exhibitionRepository.GetExhibitionByIdAsync(exhibitionId);
            if (exhibition == null)
                return null;

            // Update fields if provided
            if (dto.Title != null) exhibition.Title = dto.Title;
            if (dto.Description != null) exhibition.Description = dto.Description;
            if (dto.Location != null) exhibition.Location = dto.Location;
            if (dto.StartDate.HasValue) exhibition.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) exhibition.EndDate = dto.EndDate;

            var updated = await _exhibitionRepository.UpdateExhibitionAsync(exhibition.Id, exhibition);
            if (updated == null)
                return null;

            return new AdminExhibitionViewDto
            {
                Id = updated.Id,
                Title = updated.Title,
                Description = updated.Description ?? string.Empty,
                Location = updated.Location ?? string.Empty,
                StartDate = updated.StartDate,
                EndDate = updated.EndDate,
                CreatedAt = updated.CreatedAt,
                DeletedAt = updated.DeletedAt,
                TotalArtworks = 0, // Could be calculated if needed
                TotalVisitors = 0   // Could be calculated if needed
            };
        }

        public async Task<bool> DeleteExhibitionAsync(long exhibitionId, DeleteExhibitionDto dto)
        {
            var exhibition = await _exhibitionRepository.GetExhibitionByIdAsync(exhibitionId);
            if (exhibition == null)
                return false;

            exhibition.DeletedAt = TimeUtils.GetCurrentTime();
            var updated = await _exhibitionRepository.UpdateExhibitionAsync(exhibition.Id, exhibition);
            return updated != null;
        }

        // ===========================================
        // ARTWORK FULL MANAGEMENT
        // ===========================================

        public async Task<AdminArtworkViewDto?> UpdateArtworkAsync(long artworkId, UpdateArtworkAdminDto dto)
        {
            var artwork = await _artworkRepository.GetArtworkByIdAsync(artworkId);
            if (artwork == null)
                return null;

            // Update fields if provided
            if (dto.Title != null) artwork.Title = dto.Title;
            if (dto.Description != null) artwork.Description = dto.Description;
            if (dto.BasePrice.HasValue) artwork.FixedPrice = dto.BasePrice.Value;
            if (dto.Currency != null) artwork.Currency = dto.Currency;
            if (dto.Status.HasValue) artwork.Status = dto.Status.Value;
            
            artwork.UpdatedAt = TimeUtils.GetCurrentTime();

            var updated = await _artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);
            if (updated == null)
                return null;

            return await _adminRepository.GetArtworkDetailsForAdminAsync(artworkId);
        }

        // ===========================================
        // PURCHASE REQUEST MANAGEMENT
        // ===========================================

        public async Task<IEnumerable<AdminOrderViewDto>> GetPendingPurchaseRequestsAsync(int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            return await _adminRepository.GetPendingOrdersAsync(skip, pageSize);
        }

        public async Task<IEnumerable<AdminOrderViewDto>> GetAllPendingPurchaseRequestsAsync()
        {
            return await _adminRepository.GetPendingOrdersAsync(0, int.MaxValue);
        }

        public async Task<bool> ApprovePurchaseRequestAsync(long orderId, ApprovePurchaseDto dto)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.Status != OrderStatus.Pending)
                return false;

            order.Status = OrderStatus.Paid;
            order.UpdatedAt = TimeUtils.GetCurrentTime();

            var updated = await _orderRepository.UpdateOrderAsync(order.Id, order);
            return updated != null;
        }

        public async Task<bool> RejectPurchaseRequestAsync(long orderId, RejectPurchaseDto dto)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.Status != OrderStatus.Pending)
                return false;

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = TimeUtils.GetCurrentTime();

            var updated = await _orderRepository.UpdateOrderAsync(order.Id, order);
            return updated != null;
        }

        private string HashPassword(string password)
        {
            // Simple hash for demo - use proper password hashing in production (BCrypt, Argon2, etc.)
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "SynosSecretSalt"));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
