using Synos.Api.DTOs;

namespace Synos.Api.Services
{
    public interface ISellerService
    {
        Task<SellerArtworkDto?> CreateArtworkAsync(long sellerId, CreateArtworkDto artworkDto);
        Task<SellerArtworkDto?> CreateArtworkWithFilesAsync(long sellerId, CreateArtworkWithFilesDto artworkDto);
        Task<IEnumerable<SellerArtworkDto>> GetArtworksBySellerAsync(long sellerId);
        Task<IEnumerable<SalesHistoryDto>> GetSalesHistoryAsync(long sellerId);
    }
}