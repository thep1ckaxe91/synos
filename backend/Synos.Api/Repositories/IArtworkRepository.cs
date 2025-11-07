using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface IArtworkRepository
    {
        // Basic Artwork Operations
        Task<Artwork?> GetArtworkByIdAsync(long id);
        Task<IEnumerable<Artwork>> GetAllArtworksAsync(int skip = 0, int take = 50);
        Task<Artwork> CreateArtworkAsync(Artwork artwork);
        Task<Artwork?> UpdateArtworkAsync(long id, Artwork artwork);
        Task<bool> DeleteArtworkAsync(long id);

        // Seller Operations
        Task<IEnumerable<Artwork>> GetArtworksBySellerIdAsync(long sellerId);
        Task<IEnumerable<Artwork>> GetArtworksByCategoryIdAsync(long categoryId);

        // Status and Filtering
        Task<IEnumerable<Artwork>> GetArtworksByStatusAsync(ArtworkStatus status);
        Task<IEnumerable<Artwork>> GetActiveArtworksAsync();
        Task<IEnumerable<Artwork>> GetAvailableArtworksAsync();

        // Admin Management
        Task<IEnumerable<Artwork>> GetArtworksForReviewAsync(); 
        Task<Artwork?> ApproveArtworkAsync(long artworkId);
        Task<Artwork?> RejectArtworkAsync(long artworkId);

        // Images
        Task<IEnumerable<ArtworkImage>> GetArtworkImagesAsync(long artworkId);
        Task<ArtworkImage> AddArtworkImageAsync(ArtworkImage artworkImage);
        Task<bool> DeleteArtworkImageAsync(long imageId);

        // Statistics
        Task<int> GetTotalArtworksCountAsync();
        Task<int> GetActiveArtworksCountAsync();
        Task<int> GetArtworksCountByStatusAsync(ArtworkStatus status);
        Task<IEnumerable<Artwork>> GetRecentArtworksAsync(int count = 10);
    }
}