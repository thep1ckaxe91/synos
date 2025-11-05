using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    [Table("exhibition_artworks")]
    public class ExhibitionArtwork
    {
        [Key]
        [Column("exhibition_id")]
        public long ExhibitionId { get; set; }

        [Key]
        [Column("artwork_id")]
        public long ArtworkId { get; set; }

        [Column("display_from")]
        public DateTime? DisplayFrom { get; set; }

        [Column("display_to")]
        public DateTime? DisplayTo { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("ExhibitionId")]
        public virtual Exhibition Exhibition { get; set; } = null!;

        [ForeignKey("ArtworkId")]
        public virtual Artwork Artwork { get; set; } = null!;
    }
}