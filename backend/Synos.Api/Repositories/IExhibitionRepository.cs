using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface IExhibitionRepository
    {
        // Basic Exhibition Operations
        Task<Exhibition?> GetExhibitionByIdAsync(long id);
        Task<IEnumerable<Exhibition>> GetAllExhibitionsAsync(int skip = 0, int take = 50);
        Task<Exhibition> CreateExhibitionAsync(Exhibition exhibition);
        Task<Exhibition?> UpdateExhibitionAsync(long id, Exhibition exhibition);
        Task<bool> DeleteExhibitionAsync(long id);

        // Exhibition Status
        Task<IEnumerable<Exhibition>> GetActiveExhibitionsAsync();
        Task<IEnumerable<Exhibition>> GetUpcomingExhibitionsAsync();
        Task<IEnumerable<Exhibition>> GetPastExhibitionsAsync();

        // Exhibition Artworks Management
        Task<IEnumerable<ExhibitionArtwork>> GetExhibitionArtworksAsync(long exhibitionId);
        Task<ExhibitionArtwork> AddArtworkToExhibitionAsync(long exhibitionId, long artworkId);
        Task<bool> RemoveArtworkFromExhibitionAsync(long exhibitionId, long artworkId);
        Task<IEnumerable<Artwork>> GetArtworksByExhibitionIdAsync(long exhibitionId);

        // Statistics
        Task<int> GetTotalExhibitionsCountAsync();
        Task<int> GetActiveExhibitionsCountAsync();
        Task<int> GetArtworkCountByExhibitionIdAsync(long exhibitionId);
        Task<IEnumerable<Exhibition>> GetRecentExhibitionsAsync(int count = 10);
    }
}
