using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface IAuctionRepository
    {
        // Basic Auction Operations
        Task<Auction?> GetAuctionByIdAsync(long id);
        Task<IEnumerable<Auction>> GetAllAuctionsAsync(int skip = 0, int take = 50);
        Task<Auction> CreateAuctionAsync(Auction auction);
        Task<Auction?> UpdateAuctionAsync(long id, Auction auction);
        Task<bool> DeleteAuctionAsync(long id);

        // Auction Status
        Task<IEnumerable<Auction>> GetActiveAuctionsAsync();
        Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync();
        Task<IEnumerable<Auction>> GetCompletedAuctionsAsync();

        // Auction Management
        Task<Auction?> GetAuctionByArtworkIdAsync(long artworkId);
        Task<IEnumerable<Auction>> GetAuctionsBySellerIdAsync(long sellerId);

        // Statistics
        Task<int> GetTotalAuctionsCountAsync();
        Task<int> GetActiveAuctionsCountAsync();
        Task<IEnumerable<Auction>> GetRecentAuctionsAsync(int count = 10);
    }
}