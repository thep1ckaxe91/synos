using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface ISellerRepository
    {
        // Basic Seller Operations
        Task<Seller?> GetSellerByIdAsync(long id);
        Task<Seller?> GetSellerByMemberIdAsync(long memberId);
        Task<IEnumerable<Seller>> GetAllSellersAsync(int skip = 0, int take = 50);
        Task<Seller> CreateSellerAsync(Seller seller);
        Task<Seller?> UpdateSellerAsync(long id, Seller seller);
        Task<bool> DeleteSellerAsync(long id);

        // Seller Statistics
        Task<int> GetTotalSellersCountAsync();
        Task<int> GetActiveSellersCountAsync();
        Task<int> GetArtworkCountBySellerIdAsync(long sellerId);
        Task<decimal> GetRevenueBySellerIdAsync(long sellerId);
        Task<IEnumerable<Seller>> GetTopSellersAsync(int count = 10);
    }
}