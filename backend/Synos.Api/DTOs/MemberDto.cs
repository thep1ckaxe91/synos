namespace Synos.Api.DTOs
{
    public class MemberDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
    }

    public class MemberLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class MemberRegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Role { get; set; } = "Buyer";
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
    }

    public class UpdateMemberProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class PersonalGalleryDto
    {
        public long ArtworkId { get; set; }
        public string ArtworkTitle { get; set; } = string.Empty;
        public string? ArtworkDescription { get; set; }
        public decimal? Price { get; set; }
        public string? PrimaryImage { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public DateTime AddedAt { get; set; }
    }

    public class AddToGalleryDto
    {
        public long ArtworkId { get; set; }
    }

    public class AuthResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public MemberDto? Member { get; set; }
        public string? Token { get; set; }
    }
}