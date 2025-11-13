using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    public enum MemberRole
    {
        Buyer,
        Seller
    }

    [Table("members")]
    public class Member
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column("full_name")]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Column("role")]
        public MemberRole Role { get; set; } = MemberRole.Buyer;

        [Column("phone")]
        [MaxLength(50)]
        public string? Phone { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("is_active")]
        public bool IsActive { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Seller-specific properties (only used when Role = Seller)
        [Column("bio")]
        public string? Bio { get; set; }

        [Column("profile_image")]
        [MaxLength(255)]
        public string? ProfileImage { get; set; }

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<Auction> WonAuctions { get; set; } = new List<Auction>();
        public virtual ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
    }
}