using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    [Table("artwork_images")]
    public class ArtworkImage
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("artwork_id")]
        public long ArtworkId { get; set; }

        [Required]
        [Column("file_path")]
        [MaxLength(255)]
        public string FilePath { get; set; } = string.Empty;

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("ArtworkId")]
        public virtual Artwork? Artwork { get; set; }
    }
}