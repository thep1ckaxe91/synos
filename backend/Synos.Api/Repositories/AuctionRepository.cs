using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class AuctionRepository : IAuctionRepository
    {
        private readonly ApplicationDbContext _context;

        public AuctionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Auction>> GetAllAuctionsAsync(int skip = 0, int take = 50)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<Auction?> GetAuctionByIdAsync(long id)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Include(a => a.Artwork.Category)
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
        }

        public async Task<Auction?> GetAuctionByArtworkIdAsync(long artworkId)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .FirstOrDefaultAsync(a => a.ArtworkId == artworkId && a.DeletedAt == null);
        }

        public async Task<IEnumerable<Auction>> GetActiveAuctionsAsync()
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null && 
                           a.Status == AuctionStatus.Running)
                .ToListAsync();
        }

        public async Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync()
        {
            var currentTime = TimeUtils.GetCurrentTime();
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null && a.StartTime > currentTime)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Auction>> GetEndedAuctionsAsync()
        {
            var currentTime = TimeUtils.GetCurrentTime();
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null && a.EndTime <= currentTime)
                .OrderByDescending(a => a.EndTime)
                .ToListAsync();
        }

        public async Task<Auction> CreateAuctionAsync(Auction auction)
        {
            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();
            return auction;
        }

        public async Task<Auction?> UpdateAuctionAsync(long id, Auction auction)
        {
            var existingAuction = await GetAuctionByIdAsync(id);
            if (existingAuction == null)
                return null;

            existingAuction.StartingPrice = auction.StartingPrice;
            existingAuction.ReservePrice = auction.ReservePrice;
            existingAuction.MinimumIncrement = auction.MinimumIncrement;
            existingAuction.StartTime = auction.StartTime;
            existingAuction.EndTime = auction.EndTime;
            existingAuction.Status = auction.Status;

            await _context.SaveChangesAsync();
            return existingAuction;
        }

        public async Task<bool> DeleteAuctionAsync(long id)
        {
            var auction = await GetAuctionByIdAsync(id);
            if (auction == null)
                return false;

            auction.DeletedAt = TimeUtils.GetDeleteTimestamp();
            auction.Status = AuctionStatus.Ended;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PlaceBidAsync(long auctionId, decimal bidAmount)
        {
            var auction = await GetAuctionByIdAsync(auctionId);
            if (auction == null)
                return false;

            // Validate bid timing
            var currentTime = TimeUtils.GetCurrentTime();
            if (currentTime < auction.StartTime || currentTime > auction.EndTime || auction.Status != AuctionStatus.Running)
                return false;

            if (bidAmount <= auction.StartingPrice)
                return false;

            // Note: Actual bid storage would require a separate Bid model
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EndAuctionAsync(long id)
        {
            var auction = await GetAuctionByIdAsync(id);
            if (auction == null)
                return false;

            auction.Status = AuctionStatus.Ended;
            auction.EndTime = TimeUtils.GetCurrentTime();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetActiveAuctionsCountAsync()
        {
            var currentTime = TimeUtils.GetCurrentTime();
            return await _context.Auctions
                .CountAsync(a => a.DeletedAt == null && 
                               a.StartTime <= currentTime && 
                               a.EndTime > currentTime &&
                               a.Status == AuctionStatus.Running);
        }

        public async Task<IEnumerable<Auction>> GetCompletedAuctionsAsync()
        {
            var currentTime = TimeUtils.GetCurrentTime();
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null && a.EndTime <= currentTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Auction>> GetAuctionsBySellerIdAsync(long sellerId)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Where(a => a.DeletedAt == null && a.Artwork.Seller.Id == sellerId)
                .ToListAsync();
        }

        public async Task<int> GetTotalAuctionsCountAsync()
        {
            return await _context.Auctions
                .CountAsync(a => a.DeletedAt == null);
        }

        public async Task<IEnumerable<Auction>> GetRecentAuctionsAsync(int count = 10)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Auction>> GetAuctionsByArtworkIdsAsync(IEnumerable<long> artworkIds)
        {
            return await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Include(a => a.Artwork.Seller)
                .Where(a => a.DeletedAt == null && artworkIds.Contains(a.ArtworkId))
                .ToListAsync();
        }
    }
}
