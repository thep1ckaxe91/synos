using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http; // Added for IHttpContextAccessor

namespace Synos.Api.Services
{
    public interface IMemberService
    {
        Task<AuthResultDto> LoginAsync(MemberLoginDto loginDto);
        Task<AuthResultDto> RegisterAsync(MemberRegisterDto registerDto);
        Task<MemberDto?> GetMemberProfileAsync(long memberId);
        Task<MemberDto?> UpdateProfileAsync(long memberId, UpdateMemberProfileDto updateDto);
        Task<bool> ChangePasswordAsync(long memberId, ChangePasswordDto changePasswordDto);
        Task<IEnumerable<PersonalGalleryDto>> GetPersonalGalleryAsync(long memberId);
        Task<bool> AddArtworkToGalleryAsync(long memberId, AddToGalleryDto addDto);
        Task<bool> RemoveArtworkFromGalleryAsync(long memberId, long artworkId);
        Task<bool> LogoutAsync(long memberId);
        
        // Favorite methods with proper DTOs
        Task<IEnumerable<FavoriteDto>> GetFavoritesAsync(long memberId);
        Task<bool> AddToFavoritesAsync(long memberId, AddToFavoriteDto addToFavoriteDto);
        Task<bool> RemoveFromFavoritesAsync(long memberId, long artworkId);
        Task<bool> IsFavoriteAsync(long memberId, long artworkId);
        Task<GuestExhibitionViewDto?> GetExhibitionAsync(long exhibitionId);
    }

    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IJwtService _jwtService;
        private readonly IExhibitionRepository _exhibitionRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MemberService(IMemberRepository memberRepository, IJwtService jwtService, 
            IExhibitionRepository exhibitionRepository, IHttpContextAccessor httpContextAccessor)
        {
            _memberRepository = memberRepository;
            _jwtService = jwtService;
            _exhibitionRepository = exhibitionRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private string GetBaseUrl()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return "http://localhost:8080"; // Fallback for Docker environment

            return $"{request.Scheme}://{request.Host}";
        }

        public async Task<AuthResultDto> LoginAsync(MemberLoginDto loginDto)
        {
            try
            {
                var member = await _memberRepository.GetMemberByEmailAsync(loginDto.Email);
                if (member == null)
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }

                if (!member.IsActive)
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Account is deactivated"
                    };
                }

                // Verify password (simple hash comparison - in production use proper hashing)
                var hashedPassword = HashPassword(loginDto.Password);
                if (member.PasswordHash != hashedPassword)
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }

                return new AuthResultDto
                {
                    Success = true,
                    Message = "Login successful",
                    Member = MapToMemberDto(member),
                    Token = _jwtService.GenerateToken(member)
                };
            }
            catch (Exception ex)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Login failed: " + ex.Message
                };
            }
        }

        public async Task<AuthResultDto> RegisterAsync(MemberRegisterDto registerDto)
        {
            try
            {
                // Check if email already exists
                if (await _memberRepository.IsEmailExistsAsync(registerDto.Email))
                {
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Email already exists"
                    };
                }

                // Parse role
                if (!Enum.TryParse<MemberRole>(registerDto.Role, true, out var role))
                {
                    role = MemberRole.Buyer;
                }

                var member = new Member
                {
                    Email = registerDto.Email,
                    PasswordHash = HashPassword(registerDto.Password),
                    FullName = registerDto.FullName,
                    Phone = registerDto.Phone,
                    Role = role,
                    Bio = registerDto.Bio,
                    ProfileImage = registerDto.ProfileImage,
                    IsActive = false, // New members are inactive by default
                    CreatedAt = TimeUtils.GetCreateTimestamp(),
                    UpdatedAt = TimeUtils.GetCreateTimestamp()
                };

                var createdMember = await _memberRepository.CreateMemberAsync(member);

                return new AuthResultDto
                {
                    Success = true,
                    Message = "Registration successful",
                    Member = MapToMemberDto(createdMember),
                    Token = _jwtService.GenerateToken(createdMember)
                };
            }
            catch (Exception ex)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Registration failed: " + ex.Message
                };
            }
        }

        public async Task<MemberDto?> GetMemberProfileAsync(long memberId)
        {
            var member = await _memberRepository.GetMemberByIdAsync(memberId);
            return member != null ? MapToMemberDto(member) : null;
        }

        public async Task<MemberDto?> UpdateProfileAsync(long memberId, UpdateMemberProfileDto updateDto)
        {
            var member = new Member
            {
                FullName = updateDto.FullName,
                Phone = updateDto.Phone,
                Bio = updateDto.Bio,
                ProfileImage = updateDto.ProfileImage
            };

            var updatedMember = await _memberRepository.UpdateMemberAsync(memberId, member);
            return updatedMember != null ? MapToMemberDto(updatedMember) : null;
        }

        public async Task<bool> ChangePasswordAsync(long memberId, ChangePasswordDto changePasswordDto)
        {
            var member = await _memberRepository.GetMemberByIdAsync(memberId);
            if (member == null)
                return false;

            // Verify current password
            var currentHashedPassword = HashPassword(changePasswordDto.CurrentPassword);
            if (member.PasswordHash != currentHashedPassword)
                return false;

            // Update password
            member.PasswordHash = HashPassword(changePasswordDto.NewPassword);
            member.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            var updated = await _memberRepository.UpdateMemberAsync(memberId, member);
            return updated != null;
        }

        public async Task<IEnumerable<PersonalGalleryDto>> GetPersonalGalleryAsync(long memberId)
        {
            var favorites = await _memberRepository.GetMemberFavoritesAsync(memberId);
            
            return favorites.Select(f => new PersonalGalleryDto
            {
                ArtworkId = f.ArtworksId,
                ArtworkTitle = f.Artwork?.Title ?? "Unknown",
                ArtworkDescription = f.Artwork?.Description,
                Price = f.Artwork?.FixedPrice,
                PrimaryImage = f.Artwork?.ArtworkImages?.FirstOrDefault(img => img.IsPrimary)?.FilePath,
                SellerName = f.Artwork?.Seller?.FullName ?? "Unknown Seller",
                AddedAt = f.CreatedAt
            }).ToList();
        }

        public async Task<bool> AddArtworkToGalleryAsync(long memberId, AddToGalleryDto addDto)
        {
            return await _memberRepository.AddToFavoritesAsync(memberId, addDto.ArtworkId);
        }

        public async Task<bool> RemoveArtworkFromGalleryAsync(long memberId, long artworkId)
        {
            return await _memberRepository.RemoveFromFavoritesAsync(memberId, artworkId);
        }

        public Task<bool> LogoutAsync(long memberId)
        {
            // In a real application, you would invalidate the token here
            // For now, just return true as logout is handled client-side
            return Task.FromResult(true);
        }

        public async Task<GuestExhibitionViewDto?> GetExhibitionAsync(long exhibitionId)
        {
            var exhibition = await _exhibitionRepository.GetExhibitionForGuestAsync(exhibitionId);
            if (exhibition == null)
            {
                return null;
            }

            var currentTime = TimeUtils.GetCurrentTime();
            var artworks = exhibition.ExhibitionArtworks
                .Where(ea => 
                    ea.Artwork.Status == ArtworkStatus.Available &&
                    ea.Artwork.DeletedAt == null &&
                    (!ea.DisplayFrom.HasValue || ea.DisplayFrom.Value <= currentTime) &&
                    (!ea.DisplayTo.HasValue || ea.DisplayTo.Value >= currentTime)
                )
                .Select(ea => new GuestArtworkInExhibitionDto
                {
                    Id = ea.Artwork.Id,
                    Title = ea.Artwork.Title,
                    PrimaryImageUrl = ea.Artwork.ArtworkImages.FirstOrDefault(i => i.IsPrimary)?.FilePath,
                    SellerName = ea.Artwork.Seller.FullName,
                })
                .ToList();
            
            // Process image URLs
            foreach (var artwork in artworks)
            {
                if (!string.IsNullOrEmpty(artwork.PrimaryImageUrl))
                {
                    artwork.PrimaryImageUrl = $"{GetBaseUrl()}/uploads/{artwork.PrimaryImageUrl.Replace("\\", "/")}";
                }
            }

            return new GuestExhibitionViewDto
            {
                Id = exhibition.Id,
                Title = exhibition.Title,
                Description = exhibition.Description,
                Location = exhibition.Location,
                StartDate = exhibition.StartDate,
                EndDate = exhibition.EndDate,
                Artworks = artworks
            };
        }

        private MemberDto MapToMemberDto(Member member)
        {
            return new MemberDto
            {
                Id = member.Id,
                Email = member.Email,
                FullName = member.FullName,
                Role = member.Role.ToString(),
                Phone = member.Phone,
                Bio = member.Bio,
                ProfileImage = member.ProfileImage,
                IsActive = member.IsActive,
                CreatedAt = member.CreatedAt
            };
        }

        private string HashPassword(string password)
        {
            // Simple hash for demo - use proper password hashing in production (BCrypt, Argon2, etc.)
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "SynosSecretSalt"));
            return Convert.ToBase64String(hashedBytes);
        }

        // Favorite methods with proper DTOs
        public async Task<IEnumerable<FavoriteDto>> GetFavoritesAsync(long memberId)
        {
            var favorites = await _memberRepository.GetMemberFavoritesAsync(memberId);
            
            return favorites.Select(f => new FavoriteDto
            {
                ArtworkId = f.ArtworksId,
                ArtworkTitle = f.Artwork?.Title ?? "Unknown",
                ArtworkDescription = f.Artwork?.Description,
                FixedPrice = f.Artwork?.FixedPrice,
                ArtworkFor = f.Artwork?.IsFor.ToString() ?? "Unknown",
                Status = f.Artwork?.Status.ToString() ?? "Unknown",
                PrimaryImage = ConvertFilePathToUrl(f.Artwork?.ArtworkImages?.FirstOrDefault(img => img.IsPrimary)?.FilePath ?? string.Empty),
                SellerName = f.Artwork?.Seller?.FullName ?? "Unknown Seller",
                CategoryName = f.Artwork?.Category?.Name ?? "Unknown Category",
                AddedToFavoritesAt = f.CreatedAt
            }).ToList();
        }

        public async Task<bool> AddToFavoritesAsync(long memberId, AddToFavoriteDto addToFavoriteDto)
        {
            return await _memberRepository.AddToFavoritesAsync(memberId, addToFavoriteDto.ArtworkId);
        }

        public async Task<bool> RemoveFromFavoritesAsync(long memberId, long artworkId)
        {
            return await _memberRepository.RemoveFromFavoritesAsync(memberId, artworkId);
        }

        public async Task<bool> IsFavoriteAsync(long memberId, long artworkId)
        {
            return await _memberRepository.IsFavoriteAsync(memberId, artworkId);
        }

        private string ConvertFilePathToUrl(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;

            // Simple URL conversion - you may need to adjust this based on your setup
            var baseUrl = "http://localhost:8080"; // This should come from configuration
            var normalizedPath = filePath.Replace("\\", "/");
            
            if (normalizedPath.StartsWith("uploads/"))
            {
                return $"{baseUrl}/{normalizedPath}";
            }
            
            return $"{baseUrl}/uploads/{normalizedPath}";
        }

        // JWT token generation is now handled by IJwtService
    }
}