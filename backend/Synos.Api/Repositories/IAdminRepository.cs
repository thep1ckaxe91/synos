using Synos.Api.Models;
using Synos.Api.DTOs;

namespace Synos.Api.Repositories
{
    public interface IAdminRepository
    {
        // ===========================================
        // ADMIN AUTHENTICATION & PROFILE ONLY
        // ===========================================
        Task<Admin?> GetAdminByIdAsync(long id);
        Task<Admin?> GetAdminByEmailAsync(string email);
        Task<Admin> CreateAdminAsync(Admin admin);
        Task<Admin?> UpdateAdminAsync(long id, Admin admin);
        Task<bool> DeleteAdminAsync(long id);
        Task<bool> IsAdminEmailExistsAsync(string email);

        // ===========================================
        // ADMIN-SPECIFIC DATA VIEWS 
        // (Enriched data for admin dashboard)
        // ===========================================
        
        // Member Management - Admin Views Only
        Task<IEnumerable<AdminMemberViewDto>> GetMembersForAdminAsync(int skip = 0, int take = 50);
        Task<AdminMemberViewDto?> GetMemberDetailsForAdminAsync(long memberId);
        Task<int> GetPendingMembersCountAsync();
        Task<int> GetActiveMembersCountAsync();
        
        // Artwork Management - Admin Views Only  
        Task<IEnumerable<AdminArtworkViewDto>> GetArtworksForAdminAsync(int skip = 0, int take = 50);
        Task<AdminArtworkViewDto?> GetArtworkDetailsForAdminAsync(long artworkId);
        Task<int> GetArtworksCountByStatusAsync(ArtworkStatus status);
        
        // Order/Purchase Management - Admin Views Only
        Task<IEnumerable<TransactionMonitorDto>> GetTransactionsForAdminAsync(int skip = 0, int take = 50);
        Task<IEnumerable<TransactionMonitorDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate, int skip = 0, int take = 50);
        Task<TransactionMonitorDto?> GetTransactionDetailsForAdminAsync(long orderId);
        Task<IEnumerable<AdminOrderViewDto>> GetPendingOrdersAsync(int skip = 0, int take = 50);
        
        // Exhibition Management - Admin Views Only
        Task<IEnumerable<AdminExhibitionViewDto>> GetExhibitionsForAdminAsync(int skip = 0, int take = 50);
        Task<AdminExhibitionViewDto?> GetExhibitionDetailsForAdminAsync(long exhibitionId);

        // ===========================================
        // DASHBOARD & ANALYTICS
        // ===========================================
        Task<AdminDashboardDto> GetDashboardStatsAsync();
        Task<int> GetTotalActiveUsersCountAsync();
        Task<int> GetTotalActiveArtworksCountAsync();
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetMonthlyRevenueAsync(int year, int month);
        Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10);
        
        // Popular Content Analytics
        Task<IEnumerable<AdminArtworkViewDto>> GetMostViewedArtworksAsync(int count = 10);
        Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(int count = 10);
        
        // System Health & Statistics
        Task<IEnumerable<(DateTime Date, int Count)>> GetDailyRegistrationsAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(int Year, int Month, decimal Revenue)>> GetRevenueByMonthAsync(int year);
        Task<DateTime> GetLastSystemUpdateAsync();
    }
}
