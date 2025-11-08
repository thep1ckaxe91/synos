using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class ArtworkRepository : IArtworkRepository
    {
        private readonly ApplicationDbContext _context;

        public ArtworkRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Artwork>> GetAllArtworksAsync()
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Artwork?> GetArtworkByIdAsync(long id)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
        }

        public async Task<IEnumerable<Artwork>> GetArtworksBySellerIdAsync(long sellerId)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.ArtworkImages)
                .Where(a => a.SellerId == sellerId && a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Artwork>> GetArtworksByCategoryIdAsync(long categoryId)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.CategoryId == categoryId && a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Artwork>> GetArtworksByStatusAsync(ArtworkStatus status)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.Status == status && a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Artwork> CreateArtworkAsync(Artwork artwork)
        {
            _context.Artworks.Add(artwork);
            await _context.SaveChangesAsync();
            return artwork;
        }

        public async Task<Artwork?> UpdateArtworkAsync(long id, Artwork artwork)
        {
            var existingArtwork = await GetArtworkByIdAsync(id);
            if (existingArtwork == null)
                return null;

            existingArtwork.Title = artwork.Title;
            existingArtwork.Description = artwork.Description;
            existingArtwork.CategoryId = artwork.CategoryId;
            existingArtwork.CreationYear = artwork.CreationYear;
            existingArtwork.Dimensions = artwork.Dimensions;
            existingArtwork.Condition = artwork.Condition;
            existingArtwork.IsFor = artwork.IsFor;
            existingArtwork.FixedPrice = artwork.FixedPrice;
            existingArtwork.Currency = artwork.Currency;
            existingArtwork.Status = artwork.Status;
            existingArtwork.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return existingArtwork;
        }

        public async Task<bool> DeleteArtworkAsync(long id)
        {
            var artwork = await GetArtworkByIdAsync(id);
            if (artwork == null)
                return false;

            artwork.DeletedAt = TimeUtils.GetDeleteTimestamp();
            artwork.Status = ArtworkStatus.Pending;
            artwork.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Artwork>> SearchArtworksAsync(string searchTerm)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null &&
                           (a.Title.Contains(searchTerm) || 
                            (a.Description != null && a.Description.Contains(searchTerm)) ||
                            (a.Category != null && a.Category.Name.Contains(searchTerm))))
                .ToListAsync();
        }

        public async Task<IEnumerable<ArtworkImage>> GetArtworkImagesAsync(long artworkId)
        {
            return await _context.ArtworkImages
                .Where(ai => ai.ArtworkId == artworkId)
                .OrderByDescending(ai => ai.IsPrimary)
                .ThenBy(ai => ai.UploadedAt)
                .ToListAsync();
        }

        public async Task<ArtworkImage> AddArtworkImageAsync(ArtworkImage artworkImage)
        {
            _context.ArtworkImages.Add(artworkImage);
            await _context.SaveChangesAsync();
            return artworkImage;
        }

        public async Task<bool> RemoveArtworkImageAsync(long imageId)
        {
            var image = await _context.ArtworkImages.FindAsync(imageId);
            if (image == null)
                return false;

            _context.ArtworkImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetPrimaryImageAsync(long artworkId, long imageId)
        {
            // Remove primary flag from all images of this artwork
            var artworkImages = await _context.ArtworkImages
                .Where(ai => ai.ArtworkId == artworkId)
                .ToListAsync();

            foreach (var img in artworkImages)
            {
                img.IsPrimary = img.Id == imageId;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Missing interface methods
        public async Task<IEnumerable<Artwork>> GetAllArtworksAsync(int skip = 0, int take = 50)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<Artwork>> GetActiveArtworksAsync()
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.Status == ArtworkStatus.Available && a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Artwork>> GetAvailableArtworksAsync()
        {
            return await GetActiveArtworksAsync();
        }

        public async Task<IEnumerable<Artwork>> GetArtworksForReviewAsync()
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.Status == ArtworkStatus.Pending && a.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Artwork?> ApproveArtworkAsync(long artworkId)
        {
            var artwork = await GetArtworkByIdAsync(artworkId);
            if (artwork == null)
                return null;

            artwork.Status = ArtworkStatus.Available;
            artwork.UpdatedAt = TimeUtils.GetUpdateTimestamp();
            await _context.SaveChangesAsync();
            return artwork;
        }

        public async Task<Artwork?> RejectArtworkAsync(long artworkId)
        {
            var artwork = await GetArtworkByIdAsync(artworkId);
            if (artwork == null)
                return null;

            artwork.Status = ArtworkStatus.Pending;
            artwork.UpdatedAt = TimeUtils.GetUpdateTimestamp();
            await _context.SaveChangesAsync();
            return artwork;
        }

        public async Task<bool> DeleteArtworkImageAsync(long imageId)
        {
            return await RemoveArtworkImageAsync(imageId);
        }

        public async Task<int> GetTotalArtworksCountAsync()
        {
            return await _context.Artworks
                .CountAsync(a => a.DeletedAt == null);
        }

        public async Task<int> GetActiveArtworksCountAsync()
        {
            return await _context.Artworks
                .CountAsync(a => a.Status == ArtworkStatus.Available && a.DeletedAt == null);
        }

        public async Task<int> GetArtworksCountByStatusAsync(ArtworkStatus status)
        {
            return await _context.Artworks
                .CountAsync(a => a.Status == status && a.DeletedAt == null);
        }

        public async Task<IEnumerable<Artwork>> GetRecentArtworksAsync(int count = 10)
        {
            return await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
