using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class CommissionRepository : ICommissionRepository
    {
        private readonly ApplicationDbContext _context;

        public CommissionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Commission>> GetAllCommissionsAsync()
        {
            return await _context.Commissions
                .Include(c => c.Artwork)
                .Where(c => c.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Commission?> GetCommissionByIdAsync(int id)
        {
            return await _context.Commissions
                .Include(c => c.Artwork)
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
        }

        public async Task<IEnumerable<Commission>> GetCommissionsByArtworkIdAsync(int artworkId)
        {
            return await _context.Commissions
                .Include(c => c.Artwork)
                .Where(c => c.ArtworkId == artworkId && c.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Commission>> GetCommissionsByTypeAsync(CommissionType commissionType)
        {
            return await _context.Commissions
                .Include(c => c.Artwork)
                .Where(c => c.CommissionType == commissionType && c.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Commission> CreateCommissionAsync(Commission commission)
        {
            commission.AppliedAt = TimeUtils.GetCreateTimestamp();
            
            _context.Commissions.Add(commission);
            await _context.SaveChangesAsync();
            return commission;
        }

        public async Task<Commission?> UpdateCommissionAsync(Commission commission)
        {
            _context.Commissions.Update(commission);
            await _context.SaveChangesAsync();
            return commission;
        }

        public async Task<bool> DeleteCommissionAsync(int id)
        {
            var commission = await _context.Commissions.FindAsync(id);
            if (commission == null)
                return false;

            commission.DeletedAt = TimeUtils.GetDeleteTimestamp();
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetTotalCommissionsCountAsync()
        {
            return await _context.Commissions
                .Where(c => c.DeletedAt == null)
                .CountAsync();
        }

        public async Task<decimal> GetTotalCommissionValueAsync()
        {
            return await _context.Commissions
                .Where(c => c.DeletedAt == null)
                .SumAsync(c => c.Value);
        }
    }
}
