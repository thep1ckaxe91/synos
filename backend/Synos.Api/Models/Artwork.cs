using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    public enum ArtworkFor
    {
        Auction,
        Fixed
    }

    public enum ArtworkStatus
    {
        Pending,
        Available,
        Reserved,
        Sold
    }

    [Table("artworks")]
    public class Artwork
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("seller_id")]
        public long SellerId { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("creation_year")]
        public short? CreationYear { get; set; }

        [Column("dimensions")]
        [MaxLength(100)]
        public string? Dimensions { get; set; }

        [Column("condition")]
        [MaxLength(150)]
        public string? Condition { get; set; }

        [Column("is_for")]
        public ArtworkFor IsFor { get; set; } = ArtworkFor.Fixed;

        [Column("fixed_price", TypeName = "decimal(12,2)")]
        public decimal? FixedPrice { get; set; }

        [Column("currency")]
        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        [Column("status")]
        public ArtworkStatus Status { get; set; } = ArtworkStatus.Pending;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("SellerId")]
        public virtual Member Seller { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        public virtual ICollection<ArtworkImage> ArtworkImages { get; set; } = new List<ArtworkImage>();
        public virtual ICollection<ExhibitionArtwork> ExhibitionArtworks { get; set; } = new List<ExhibitionArtwork>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<Commission> Commissions { get; set; } = new List<Commission>();
        public virtual ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    }
}