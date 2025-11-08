using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface ICommissionRepository
    {
        // Basic Commission Operations
        Task<Commission?> GetCommissionByIdAsync(int id);
        Task<IEnumerable<Commission>> GetAllCommissionsAsync();
        Task<Commission> CreateCommissionAsync(Commission commission);
        Task<Commission?> UpdateCommissionAsync(Commission commission);
        Task<bool> DeleteCommissionAsync(int id);

        // Commission Filtering
        Task<IEnumerable<Commission>> GetCommissionsByArtworkIdAsync(int artworkId);
        Task<IEnumerable<Commission>> GetCommissionsByTypeAsync(CommissionType commissionType);

        // Statistics
        Task<int> GetTotalCommissionsCountAsync();
        Task<decimal> GetTotalCommissionValueAsync();
    }
}
