using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    public enum CommissionType
    {
        Percentage,
        Fixed
    }

    [Table("commissions")]
    public class Commission
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("artwork_id")]
        public long? ArtworkId { get; set; }

        [Column("commission_type")]
        public CommissionType CommissionType { get; set; }

        [Required]
        [Column("value", TypeName = "decimal(18,4)")]
        public decimal Value { get; set; }

        [Column("applied_at")]
        public DateTime AppliedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public virtual Artwork? Artwork { get; set; }
    }
}