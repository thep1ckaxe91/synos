using Synos.Api.DTOs;

namespace Synos.Api.Services
{
    public interface IGuestService
    {
        // Artwork browsing and viewing
        Task<IEnumerable<GuestArtworkDto>> GetAllArtworksAsync(int skip = 0, int take = 50);
        Task<GuestArtworkDetailDto?> GetArtworkDetailsAsync(long artworkId);
        Task<IEnumerable<GuestArtworkDto>> GetArtworksByCategoryAsync(int categoryId, int skip = 0, int take = 50);
        Task<IEnumerable<GuestArtworkDto>> GetFeaturedArtworksAsync(int count = 10);
        Task<IEnumerable<GuestArtworkDto>> GetRecentArtworksAsync(int count = 10);
        Task<IEnumerable<GuestArtworkDto>> GetRelatedArtworksAsync(long artworkId, int count = 5);

        // Search functionality
        Task<GuestSearchResultDto> SearchArtworksAsync(GuestSearchRequestDto searchRequest);

        // Category management
        Task<IEnumerable<GuestCategoryDto>> GetAllCategoriesAsync();
        Task<GuestCategoryDto?> GetCategoryDetailsAsync(int categoryId);

        // Exhibition management
        Task<IEnumerable<GuestExhibitionDto>> GetAllExhibitionsAsync(int skip = 0, int take = 50);
        Task<GuestExhibitionDto?> GetExhibitionDetailsAsync(long exhibitionId);
        Task<IEnumerable<GuestExhibitionDto>> GetActiveExhibitionsAsync();
        Task<IEnumerable<GuestExhibitionDto>> GetUpcomingExhibitionsAsync();
        Task<IEnumerable<GuestExhibitionDto>> GetPastExhibitionsAsync();
        Task<IEnumerable<GuestArtworkDto>> GetExhibitionArtworksAsync(long exhibitionId);
        Task<GuestExhibitionViewDto?> GetExhibitionAsync(long exhibitionId);

        // Statistics and overview
        Task<GuestStatisticsDto> GetStatisticsAsync();
    }
}