using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    [Table("exhibitions")]
    public class Exhibition
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("location")]
        [MaxLength(255)]
        public string? Location { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public virtual ICollection<ExhibitionArtwork> ExhibitionArtworks { get; set; } = new List<ExhibitionArtwork>();
    }
}