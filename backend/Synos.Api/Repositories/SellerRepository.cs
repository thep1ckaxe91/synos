using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class SellerRepository : ISellerRepository
    {
        private readonly ApplicationDbContext _context;

        public SellerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Seller>> GetAllSellersAsync(int skip = 0, int take = 50)
        {
            return await _context.Sellers
                .Include(s => s.Member)
                .Include(s => s.Artworks.Where(a => a.DeletedAt == null))
                .Where(s => s.DeletedAt == null)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<Seller?> GetSellerByIdAsync(long id)
        {
            return await _context.Sellers
                .Include(s => s.Member)
                .Include(s => s.Artworks.Where(a => a.DeletedAt == null))
                .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
        }

        public async Task<Seller?> GetSellerByMemberIdAsync(long memberId)
        {
            return await _context.Sellers
                .Include(s => s.Member)
                .Include(s => s.Artworks.Where(a => a.DeletedAt == null))
                .FirstOrDefaultAsync(s => s.Id == memberId && s.DeletedAt == null);
        }

        public async Task<Seller> CreateSellerAsync(Seller seller)
        {
            _context.Sellers.Add(seller);
            await _context.SaveChangesAsync();
            return seller;
        }

        public async Task<Seller?> UpdateSellerAsync(long id, Seller seller)
        {
            var existingSeller = await GetSellerByIdAsync(id);
            if (existingSeller == null)
                return null;

            existingSeller.Bio = seller.Bio;
            existingSeller.Website = seller.Website;
            existingSeller.Address = seller.Address;
            existingSeller.ProfileImage = seller.ProfileImage;

            await _context.SaveChangesAsync();
            return existingSeller;
        }

        public async Task<bool> DeleteSellerAsync(long id)
        {
            var seller = await GetSellerByIdAsync(id);
            if (seller == null)
                return false;

            seller.DeletedAt = TimeUtils.GetDeleteTimestamp();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifySellerAsync(long id)
        {
            // Note: Verification logic would need to be implemented differently
            // as the Seller model doesn't have IsVerified property
            // This might need to be handled through Member status or separate verification system
            var seller = await GetSellerByIdAsync(id);
            if (seller == null)
                return false;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Seller>> GetVerifiedSellersAsync()
        {
            return await _context.Sellers
                .Include(s => s.Member)
                .Include(s => s.Artworks.Where(a => a.DeletedAt == null))
                .Where(s => s.DeletedAt == null && s.Member.IsActive)
                .ToListAsync();
        }

        public async Task<int> GetSellerArtworkCountAsync(long sellerId)
        {
            return await _context.Artworks
                .CountAsync(a => a.SellerId == sellerId && a.DeletedAt == null);
        }

        public async Task<decimal> GetSellerTotalSalesAsync(long sellerId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Artwork)
                .Where(oi => oi.Artwork.Seller.Id == sellerId && 
                            oi.Order.Status == OrderStatus.Paid &&
                            oi.Order.DeletedAt == null)
                .SumAsync(oi => oi.Total);
        }

        public async Task<int> GetTotalSellersCountAsync()
        {
            return await _context.Sellers
                .CountAsync(s => s.DeletedAt == null);
        }

        public async Task<int> GetActiveSellersCountAsync()
        {
            return await _context.Sellers
                .CountAsync(s => s.DeletedAt == null && s.Member.IsActive);
        }

        public async Task<int> GetArtworkCountBySellerIdAsync(long sellerId)
        {
            return await _context.Artworks
                .CountAsync(a => a.SellerId == sellerId && a.DeletedAt == null);
        }

        public async Task<decimal> GetRevenueBySellerIdAsync(long sellerId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Artwork)
                .Where(oi => oi.Artwork.Seller.Id == sellerId && 
                            oi.Order.Status == OrderStatus.Paid &&
                            oi.Order.DeletedAt == null)
                .SumAsync(oi => oi.Total);
        }

        public async Task<IEnumerable<Seller>> GetTopSellersAsync(int count = 10)
        {
            // Get sellers ordered by their total sales revenue
            var sellerRevenues = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Artwork)
                    .ThenInclude(a => a.Seller)
                        .ThenInclude(s => s.Member)
                .Where(oi => oi.Order.Status == OrderStatus.Paid && oi.Order.DeletedAt == null)
                .GroupBy(oi => oi.Artwork.Seller.Id)
                .Select(g => new { SellerId = g.Key, Revenue = g.Sum(oi => oi.Total) })
                .OrderByDescending(x => x.Revenue)
                .Take(count)
                .ToListAsync();

            var sellerIds = sellerRevenues.Select(sr => sr.SellerId).ToList();
            
            return await _context.Sellers
                .Include(s => s.Member)
                .Include(s => s.Artworks.Where(a => a.DeletedAt == null))
                .Where(s => sellerIds.Contains(s.Id) && s.DeletedAt == null)
                .ToListAsync();
        }
    }
}