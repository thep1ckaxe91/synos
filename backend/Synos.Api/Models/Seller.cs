using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    [Table("sellers")]
    public class Seller
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("bio")]
        public string? Bio { get; set; }

        [Column("website")]
        [MaxLength(255)]
        public string? Website { get; set; }

        [Column("address")]
        [MaxLength(255)]
        public string? Address { get; set; }

        [Column("profile_image")]
        [MaxLength(255)]
        public string? ProfileImage { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("Id")]
        public virtual Member Member { get; set; } = null!;
        
        public virtual ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
    }
}