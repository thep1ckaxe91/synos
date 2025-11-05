using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface IMemberRepository
    {
        Task<IEnumerable<Member>> GetAllMembersAsync();
        Task<Member?> GetMemberByIdAsync(long id);
        Task<Member?> GetMemberByEmailAsync(string email);
        Task<Member> CreateMemberAsync(Member member);
        Task<Member?> UpdateMemberAsync(long id, Member member);
        Task<bool> DeleteMemberAsync(long id);
        Task<bool> IsEmailExistsAsync(string email);
        Task<IEnumerable<Favorite>> GetMemberFavoritesAsync(long memberId);
        Task<bool> AddToFavoritesAsync(long memberId, long artworkId);
        Task<bool> RemoveFromFavoritesAsync(long memberId, long artworkId);
        Task<bool> IsFavoriteAsync(long memberId, long artworkId);
    }
}