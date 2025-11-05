using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    [Table("favorite")]
    public class Favorite
    {
        [Key]
        [Column("artworks_id")]
        public long ArtworksId { get; set; }

        [Key]
        [Column("user_id")]
        public long UserId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("ArtworksId")]
        public virtual Artwork Artwork { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual Member User { get; set; } = null!;
    }
}