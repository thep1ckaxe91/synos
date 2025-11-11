using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("order_id")]
        public long OrderId { get; set; }

        [Column("artwork_id")]
        public long ArtworkId { get; set; }

        [Required]
        [Column("total", TypeName = "decimal(12,2)")]
        public decimal Total { get; set; }





        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } = null!;

        [ForeignKey("ArtworkId")]
        public virtual Artwork Artwork { get; set; } = null!;
    }
}