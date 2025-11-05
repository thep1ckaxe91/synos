using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly ApplicationDbContext _context;

        public MemberRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Member>> GetAllMembersAsync()
        {
            return await _context.Members
                .Where(m => m.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Member?> GetMemberByIdAsync(long id)
        {
            return await _context.Members
                .FirstOrDefaultAsync(m => m.Id == id && m.DeletedAt == null);
        }

        public async Task<Member?> GetMemberByEmailAsync(string email)
        {
            return await _context.Members
                .FirstOrDefaultAsync(m => m.Email == email && m.DeletedAt == null);
        }

        public async Task<Member> CreateMemberAsync(Member member)
        {
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<Member?> UpdateMemberAsync(long id, Member member)
        {
            var existingMember = await GetMemberByIdAsync(id);
            if (existingMember == null)
                return null;

            existingMember.FullName = member.FullName;
            existingMember.Phone = member.Phone;
            existingMember.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return existingMember;
        }

        public async Task<bool> DeleteMemberAsync(long id)
        {
            var member = await GetMemberByIdAsync(id);
            if (member == null)
                return false;

            member.DeletedAt = TimeUtils.GetDeleteTimestamp();
            member.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.Members
                .AnyAsync(m => m.Email == email && m.DeletedAt == null);
        }

        public async Task<IEnumerable<Favorite>> GetMemberFavoritesAsync(long memberId)
        {
            return await _context.Favorites
                .Include(f => f.Artwork)
                    .ThenInclude(a => a.ArtworkImages.Where(img => img.IsPrimary))
                .Include(f => f.Artwork.Seller)
                    .ThenInclude(s => s.Member)
                .Where(f => f.UserId == memberId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> AddToFavoritesAsync(long memberId, long artworkId)
        {
            // Check if already exists
            var exists = await IsFavoriteAsync(memberId, artworkId);
            if (exists)
                return false;

            var favorite = new Favorite
            {
                UserId = memberId,
                ArtworksId = artworkId,
                CreatedAt = TimeUtils.GetCreateTimestamp(),
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromFavoritesAsync(long memberId, long artworkId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == memberId && f.ArtworksId == artworkId);

            if (favorite == null)
                return false;

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavoriteAsync(long memberId, long artworkId)
        {
            return await _context.Favorites
                .AnyAsync(f => f.UserId == memberId && f.ArtworksId == artworkId);
        }
    }
}