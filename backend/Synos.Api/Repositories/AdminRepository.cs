using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.DTOs;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public AdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ===========================================
        // ADMIN AUTHENTICATION & PROFILE ONLY
        // ===========================================

        public async Task<Admin?> GetAdminByIdAsync(long id)
        {
            return await _context.Admins
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
        }

        public async Task<Admin?> GetAdminByEmailAsync(string email)
        {
            return await _context.Admins
                .FirstOrDefaultAsync(a => a.Email == email && a.DeletedAt == null);
        }

        public async Task<Admin> CreateAdminAsync(Admin admin)
        {
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        public async Task<Admin?> UpdateAdminAsync(long id, Admin admin)
        {
            var existingAdmin = await GetAdminByIdAsync(id);
            if (existingAdmin == null)
                return null;

            existingAdmin.FullName = admin.FullName;
            existingAdmin.Phone = admin.Phone;
            existingAdmin.IsActive = admin.IsActive;
            existingAdmin.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return existingAdmin;
        }

        public async Task<bool> DeleteAdminAsync(long id)
        {
            var admin = await GetAdminByIdAsync(id);
            if (admin == null)
                return false;

            admin.DeletedAt = TimeUtils.GetDeleteTimestamp();
            admin.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsAdminEmailExistsAsync(string email)
        {
            return await _context.Admins
                .AnyAsync(a => a.Email == email && a.DeletedAt == null);
        }

        // ===========================================
        // ADMIN-SPECIFIC DATA VIEWS 
        // ===========================================

        public async Task<IEnumerable<AdminMemberViewDto>> GetMembersForAdminAsync(int skip = 0, int take = 50)
        {
            return await _context.Members
                .Include(m => m.Orders)
                .Include(m => m.Seller)
                .Where(m => m.DeletedAt == null || m.DeletedAt != null) // Include all members for admin
                .Select(m => new AdminMemberViewDto
                {
                    Id = m.Id,
                    Email = m.Email,
                    FullName = m.FullName,
                    Role = m.Role,
                    Phone = m.Phone,
                    IsActive = m.IsActive,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    DeletedAt = m.DeletedAt,
                    TotalOrders = m.Orders.Count,
                    TotalSpent = m.Orders.Where(o => o.Status == OrderStatus.Paid).Sum(o => o.TotalAmount)
                })
                .OrderByDescending(m => m.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<AdminMemberViewDto?> GetMemberDetailsForAdminAsync(long memberId)
        {
            return await _context.Members
                .Include(m => m.Orders)
                .Include(m => m.Seller)
                .Include(m => m.Favorites)
                .Where(m => m.Id == memberId)
                .Select(m => new AdminMemberViewDto
                {
                    Id = m.Id,
                    Email = m.Email,
                    FullName = m.FullName,
                    Role = m.Role,
                    Phone = m.Phone,
                    IsActive = m.IsActive,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    DeletedAt = m.DeletedAt,
                    TotalOrders = m.Orders.Count,
                    TotalSpent = m.Orders.Where(o => o.Status == OrderStatus.Paid).Sum(o => o.TotalAmount)
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetPendingMembersCountAsync()
        {
            return await _context.Members
                .CountAsync(m => !m.IsActive && m.DeletedAt == null);
        }

        public async Task<int> GetActiveMembersCountAsync()
        {
            return await _context.Members
                .CountAsync(m => m.IsActive && m.DeletedAt == null);
        }

        public async Task<IEnumerable<AdminArtworkViewDto>> GetArtworksForAdminAsync(int skip = 0, int take = 50)
        {
            return await _context.Artworks
                .Include(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Include(a => a.Category)
                .Include(a => a.ArtworkImages)
                .Include(a => a.OrderItems)
                .Include(a => a.Favorites)
                .Select(a => new AdminArtworkViewDto
                {
                    Id = a.Id,
                    SellerId = a.SellerId,
                    Title = a.Title,
                    Description = a.Description,
                    CategoryId = a.CategoryId,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    CreationYear = a.CreationYear,
                    Dimensions = a.Dimensions,
                    Condition = a.Condition,
                    IsFor = a.IsFor,
                    FixedPrice = a.FixedPrice,
                    Currency = a.Currency,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    DeletedAt = a.DeletedAt,
                    SellerName = a.Seller.Member.FullName,
                    SellerEmail = a.Seller.Member.Email,
                    PrimaryImageUrl = a.ArtworkImages.FirstOrDefault(img => img.IsPrimary) != null ? 
                        a.ArtworkImages.FirstOrDefault(img => img.IsPrimary)!.FilePath : null,
                    TotalImages = a.ArtworkImages.Count,
                    TotalFavorites = a.Favorites.Count,
                    TotalOrders = a.OrderItems.Count
                })
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<AdminArtworkViewDto?> GetArtworkDetailsForAdminAsync(long artworkId)
        {
            return await _context.Artworks
                .Include(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Include(a => a.Category)
                .Include(a => a.ArtworkImages)
                .Include(a => a.OrderItems)
                .Include(a => a.Favorites)
                .Where(a => a.Id == artworkId)
                .Select(a => new AdminArtworkViewDto
                {
                    Id = a.Id,
                    SellerId = a.SellerId,
                    Title = a.Title,
                    Description = a.Description,
                    CategoryId = a.CategoryId,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    CreationYear = a.CreationYear,
                    Dimensions = a.Dimensions,
                    Condition = a.Condition,
                    IsFor = a.IsFor,
                    FixedPrice = a.FixedPrice,
                    Currency = a.Currency,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    DeletedAt = a.DeletedAt,
                    SellerName = a.Seller.Member.FullName,
                    SellerEmail = a.Seller.Member.Email,
                    PrimaryImageUrl = a.ArtworkImages.FirstOrDefault(img => img.IsPrimary) != null ? 
                        a.ArtworkImages.FirstOrDefault(img => img.IsPrimary)!.FilePath : null,
                    TotalImages = a.ArtworkImages.Count,
                    TotalFavorites = a.Favorites.Count,
                    TotalOrders = a.OrderItems.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetArtworksCountByStatusAsync(ArtworkStatus status)
        {
            return await _context.Artworks
                .CountAsync(a => a.Status == status && a.DeletedAt == null);
        }

        public async Task<IEnumerable<TransactionMonitorDto>> GetTransactionsForAdminAsync(int skip = 0, int take = 50)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                    .ThenInclude(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Select(o => new TransactionMonitorDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    UserEmail = o.User.Email,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Currency = o.Currency,
                    PaymentType = o.PaymentType,
                    PaymentTime = o.PaymentTime,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    DeletedAt = o.DeletedAt,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemInfoDto
                    {
                        ArtworkId = oi.ArtworkId,
                        ArtworkTitle = oi.Artwork.Title,
                        SellerName = oi.Artwork.Seller.Member.FullName,
                        Price = oi.Total
                    }).ToList(),
                    TotalItems = o.OrderItems.Count
                })
                .OrderByDescending(o => o.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<TransactionMonitorDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 50)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                    .ThenInclude(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .Select(o => new TransactionMonitorDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    UserEmail = o.User.Email,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Currency = o.Currency,
                    PaymentType = o.PaymentType,
                    PaymentTime = o.PaymentTime,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    DeletedAt = o.DeletedAt,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemInfoDto
                    {
                        ArtworkId = oi.ArtworkId,
                        ArtworkTitle = oi.Artwork.Title,
                        SellerName = oi.Artwork.Seller.Member.FullName,
                        Price = oi.Total
                    }).ToList(),
                    TotalItems = o.OrderItems.Count
                })
                .OrderByDescending(o => o.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<TransactionMonitorDto?> GetTransactionDetailsForAdminAsync(long orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                    .ThenInclude(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Where(o => o.Id == orderId)
                .Select(o => new TransactionMonitorDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    UserEmail = o.User.Email,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Currency = o.Currency,
                    PaymentType = o.PaymentType,
                    PaymentTime = o.PaymentTime,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    DeletedAt = o.DeletedAt,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemInfoDto
                    {
                        ArtworkId = oi.ArtworkId,
                        ArtworkTitle = oi.Artwork.Title,
                        SellerName = oi.Artwork.Seller.Member.FullName,
                        Price = oi.Total
                    }).ToList(),
                    TotalItems = o.OrderItems.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<AdminExhibitionViewDto>> GetExhibitionsForAdminAsync(int skip = 0, int take = 50)
        {
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                .Select(e => new AdminExhibitionViewDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description ?? string.Empty,
                    Location = e.Location ?? string.Empty,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    CreatedAt = e.CreatedAt,
                    DeletedAt = e.DeletedAt,
                    TotalArtworks = e.ExhibitionArtworks.Count,
                    TotalVisitors = 0 // Placeholder - implement visitor tracking later
                })
                .OrderByDescending(e => e.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<AdminExhibitionViewDto?> GetExhibitionDetailsForAdminAsync(long exhibitionId)
        {
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                .Where(e => e.Id == exhibitionId)
                .Select(e => new AdminExhibitionViewDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description ?? string.Empty,
                    Location = e.Location ?? string.Empty,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    CreatedAt = e.CreatedAt,
                    DeletedAt = e.DeletedAt,
                    TotalArtworks = e.ExhibitionArtworks.Count,
                    TotalVisitors = 0 // Placeholder
                })
                .FirstOrDefaultAsync();
        }

        // ===========================================
        // DASHBOARD & ANALYTICS
        // ===========================================

        public async Task<AdminDashboardDto> GetDashboardStatsAsync()
        {
            var totalMembers = await _context.Members.CountAsync(m => m.DeletedAt == null);
            var activeMembers = await _context.Members.CountAsync(m => m.IsActive && m.DeletedAt == null);
            var totalArtworks = await _context.Artworks.CountAsync(a => a.DeletedAt == null);
            var activeArtworks = await _context.Artworks.CountAsync(a => a.Status == ArtworkStatus.Available && a.DeletedAt == null);
            var pendingRegistrations = await _context.Members.CountAsync(m => !m.IsActive && m.DeletedAt == null);
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
            var totalRevenue = await _context.Orders.Where(o => o.Status == OrderStatus.Paid).SumAsync(o => o.TotalAmount);
            var currentTime = TimeUtils.GetCurrentTime();
            var monthlyRevenue = await GetMonthlyRevenueAsync(currentTime.Year, currentTime.Month);
            var totalTransactions = await _context.Orders.CountAsync();
            var activeExhibitions = await _context.Exhibitions
                .CountAsync(e => e.StartDate <= currentTime && e.EndDate >= currentTime && e.DeletedAt == null);

            var recentActivities = await GetRecentActivitiesAsync(10);

            return new AdminDashboardDto
            {
                TotalMembers = totalMembers,
                TotalActiveMembers = activeMembers,
                TotalArtworks = totalArtworks,
                TotalActiveArtworks = activeArtworks,
                PendingRegistrations = pendingRegistrations,
                PendingPurchaseRequests = pendingOrders,
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue,
                TotalTransactions = totalTransactions,
                ActiveExhibitions = activeExhibitions,
                RecentActivities = recentActivities.ToList()
            };
        }

        public async Task<int> GetTotalActiveUsersCountAsync()
        {
            return await _context.Members
                .CountAsync(m => m.IsActive && m.DeletedAt == null);
        }

        public async Task<int> GetTotalActiveArtworksCountAsync()
        {
            return await _context.Artworks
                .CountAsync(a => a.Status == ArtworkStatus.Available && a.DeletedAt == null);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid)
                .SumAsync(o => o.TotalAmount);
        }

        public async Task<decimal> GetMonthlyRevenueAsync(int year, int month)
        {
            return await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid && 
                           o.PaymentTime.Year == year && 
                           o.PaymentTime.Month == month)
                .SumAsync(o => o.TotalAmount);
        }

        public async Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10)
        {
            var activities = new List<RecentActivityDto>();

            // Recent member registrations
            var recentMembers = await _context.Members
                .OrderByDescending(m => m.CreatedAt)
                .Take(count / 2)
                .Select(m => new RecentActivityDto
                {
                    ActivityType = "Member Registration",
                    Description = $"New member registered: {m.FullName}",
                    Timestamp = m.CreatedAt,
                    UserName = m.FullName,
                    RelatedEntity = "Member"
                })
                .ToListAsync();

            activities.AddRange(recentMembers);

            // Recent orders
            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Take(count / 2)
                .Select(o => new RecentActivityDto
                {
                    ActivityType = "Order Placed",
                    Description = $"Order {o.OrderNumber} placed by {o.User.FullName}",
                    Timestamp = o.CreatedAt,
                    UserName = o.User.FullName,
                    RelatedEntity = "Order"
                })
                .ToListAsync();

            activities.AddRange(recentOrders);

            return activities.OrderByDescending(a => a.Timestamp).Take(count);
        }

        public async Task<IEnumerable<AdminArtworkViewDto>> GetMostViewedArtworksAsync(int count = 10)
        {
            // For now, return most favorited artworks as a proxy for "most viewed"
            return await _context.Artworks
                .Include(a => a.Seller)
                    .ThenInclude(s => s.Member)
                .Include(a => a.Category)
                .Include(a => a.Favorites)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null)
                .OrderByDescending(a => a.Favorites.Count)
                .Take(count)
                .Select(a => new AdminArtworkViewDto
                {
                    Id = a.Id,
                    SellerId = a.SellerId,
                    Title = a.Title,
                    Description = a.Description,
                    CategoryId = a.CategoryId,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    CreationYear = a.CreationYear,
                    Dimensions = a.Dimensions,
                    Condition = a.Condition,
                    IsFor = a.IsFor,
                    FixedPrice = a.FixedPrice,
                    Currency = a.Currency,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    DeletedAt = a.DeletedAt,
                    SellerName = a.Seller.Member.FullName,
                    SellerEmail = a.Seller.Member.Email,
                    PrimaryImageUrl = a.ArtworkImages.FirstOrDefault(img => img.IsPrimary) != null ? 
                        a.ArtworkImages.FirstOrDefault(img => img.IsPrimary)!.FilePath : null,
                    TotalImages = a.ArtworkImages.Count,
                    TotalFavorites = a.Favorites.Count,
                    TotalOrders = a.OrderItems.Count
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(int count = 10)
        {
            return await _context.Categories
                .Include(c => c.Artworks)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    ArtworkCount = c.Artworks.Count(a => a.DeletedAt == null)
                })
                .OrderByDescending(c => c.ArtworkCount)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<(DateTime Date, int Count)>> GetDailyRegistrationsAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Members
                .Where(m => m.CreatedAt >= startDate && m.CreatedAt <= endDate)
                .GroupBy(m => m.CreatedAt.Date)
                .Select(g => new ValueTuple<DateTime, int>(g.Key, g.Count()))
                .OrderBy(x => x.Item1)
                .ToListAsync();
        }

        public async Task<IEnumerable<(int Year, int Month, decimal Revenue)>> GetRevenueByMonthAsync(int year)
        {
            return await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid && o.PaymentTime.Year == year)
                .GroupBy(o => new { o.PaymentTime.Year, o.PaymentTime.Month })
                .Select(g => new ValueTuple<int, int, decimal>(g.Key.Year, g.Key.Month, g.Sum(o => o.TotalAmount)))
                .OrderBy(x => x.Item2)
                .ToListAsync();
        }

        public async Task<IEnumerable<AdminOrderViewDto>> GetPendingOrdersAsync(int skip = 0, int take = 50)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.Seller)
                            .ThenInclude(s => s.Member)
                .Where(o => o.Status == OrderStatus.Pending && o.DeletedAt == null)
                .OrderBy(o => o.CreatedAt)
                .Skip(skip)
                .Take(take)
                .Select(o => new AdminOrderViewDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    UserEmail = o.User.Email,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Currency = o.Currency,
                    PaymentType = o.PaymentType,
                    PaymentTime = o.PaymentTime,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    DeletedAt = o.DeletedAt,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemInfoDto
                    {
                        ArtworkId = oi.ArtworkId,
                        ArtworkTitle = oi.Artwork.Title,
                        SellerName = oi.Artwork.Seller.Member.FullName,
                        Price = oi.Artwork.FixedPrice ?? 0
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<DateTime> GetLastSystemUpdateAsync()
        {
            // Return the latest updated timestamp from any entity
            var latestMember = await _context.Members.MaxAsync(m => (DateTime?)m.UpdatedAt);
            var latestArtwork = await _context.Artworks.MaxAsync(a => (DateTime?)a.UpdatedAt);
            var latestOrder = await _context.Orders.MaxAsync(o => (DateTime?)o.UpdatedAt);

            var dates = new List<DateTime?> { latestMember, latestArtwork, latestOrder }
                .Where(d => d.HasValue)
                .Select(d => d!.Value);

            return dates.Any() ? dates.Max() : TimeUtils.GetCurrentTime();
        }
    }
}
