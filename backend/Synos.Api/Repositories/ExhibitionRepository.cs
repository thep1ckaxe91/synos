using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class ExhibitionRepository : IExhibitionRepository
    {
        private readonly ApplicationDbContext _context;

        public ExhibitionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Exhibition>> GetAllExhibitionsAsync(int skip = 0, int take = 50)
        {
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<Exhibition?> GetExhibitionByIdAsync(long id)
        {
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.Seller)
                .FirstOrDefaultAsync(e => e.Id == id && e.DeletedAt == null);
        }

        public async Task<IEnumerable<Exhibition>> GetActiveExhibitionsAsync()
        {
            var currentDate = TimeUtils.GetCurrentTime();
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && 
                           e.StartDate <= currentDate && 
                           e.EndDate >= currentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exhibition>> GetUpcomingExhibitionsAsync()
        {
            var currentDate = TimeUtils.GetCurrentTime();
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && e.StartDate > currentDate)
                .OrderBy(e => e.StartDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exhibition>> GetPastExhibitionsAsync()
        {
            var currentDate = TimeUtils.GetCurrentTime();
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && e.EndDate < currentDate)
                .OrderByDescending(e => e.EndDate)
                .ToListAsync();
        }

        public async Task<Exhibition> CreateExhibitionAsync(Exhibition exhibition)
        {
            _context.Exhibitions.Add(exhibition);
            await _context.SaveChangesAsync();
            return exhibition;
        }

        public async Task<Exhibition?> UpdateExhibitionAsync(long id, Exhibition exhibition)
        {
            var existingExhibition = await GetExhibitionByIdAsync(id);
            if (existingExhibition == null)
                return null;

            existingExhibition.Title = exhibition.Title;
            existingExhibition.Description = exhibition.Description;
            existingExhibition.Location = exhibition.Location;
            existingExhibition.StartDate = exhibition.StartDate;
            existingExhibition.EndDate = exhibition.EndDate;

            await _context.SaveChangesAsync();
            return existingExhibition;
        }

        public async Task<bool> DeleteExhibitionAsync(long id)
        {
            var exhibition = await GetExhibitionByIdAsync(id);
            if (exhibition == null)
                return false;

            exhibition.DeletedAt = TimeUtils.GetDeleteTimestamp();

            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<bool> RemoveArtworkFromExhibitionAsync(long exhibitionId, long artworkId)
        {
            var exhibitionArtwork = await _context.ExhibitionArtworks
                .FirstOrDefaultAsync(ea => ea.ExhibitionId == exhibitionId && ea.ArtworkId == artworkId);

            if (exhibitionArtwork == null)
                return false;

            _context.ExhibitionArtworks.Remove(exhibitionArtwork);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ExhibitionArtwork>> GetExhibitionArtworksAsync(long exhibitionId)
        {
            return await _context.ExhibitionArtworks
                .Where(ea => ea.ExhibitionId == exhibitionId)
                .Include(ea => ea.Artwork)
                    .ThenInclude(a => a.ArtworkImages)
                .Include(ea => ea.Artwork)
                    .ThenInclude(a => a.Seller)
                .Include(ea => ea.Exhibition)
                .ToListAsync();
        }

        public async Task<ExhibitionArtwork> AddArtworkToExhibitionAsync(long exhibitionId, long artworkId)
        {
            var exhibitionArtwork = new ExhibitionArtwork
            {
                ExhibitionId = exhibitionId,
                ArtworkId = artworkId
            };

            _context.ExhibitionArtworks.Add(exhibitionArtwork);
            await _context.SaveChangesAsync();
            return exhibitionArtwork;
        }

        public async Task<IEnumerable<Artwork>> GetArtworksByExhibitionIdAsync(long exhibitionId)
        {
            return await _context.ExhibitionArtworks
                .Where(ea => ea.ExhibitionId == exhibitionId)
                .Select(ea => ea.Artwork)
                .Include(a => a.ArtworkImages)
                .Include(a => a.Seller)
                .Include(a => a.Category)
                .ToListAsync();
        }

        public async Task<int> GetTotalExhibitionsCountAsync()
        {
            return await _context.Exhibitions
                .CountAsync(e => e.DeletedAt == null);
        }

        public async Task<int> GetActiveExhibitionsCountAsync()
        {
            var currentDate = TimeUtils.GetCurrentTime();
            return await _context.Exhibitions
                .CountAsync(e => e.DeletedAt == null && 
                               e.StartDate <= currentDate && 
                               e.EndDate >= currentDate);
        }

        public async Task<int> GetArtworkCountByExhibitionIdAsync(long exhibitionId)
        {
            return await _context.ExhibitionArtworks
                .CountAsync(ea => ea.ExhibitionId == exhibitionId);
        }

        public async Task<IEnumerable<Exhibition>> GetRecentExhibitionsAsync(int count = 10)
        {
            return await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null)
                .OrderByDescending(e => e.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
