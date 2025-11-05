using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Synos.Api.Models
{
    public enum OrderStatus
    {
        Pending,
        Paid,
        Cancelled,
        Refunded
    }

    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Required]
        [Column("order_number")]
        [MaxLength(64)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        [Column("total_amount", TypeName = "decimal(12,2)")]
        public decimal TotalAmount { get; set; }

        [Column("currency")]
        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        [Required]
        [Column("payment_type")]
        [MaxLength(255)]
        public string PaymentType { get; set; } = string.Empty;

        [Column("payment_time")]
        public DateTime PaymentTime { get; set; }

        [Column("status")]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual Member User { get; set; } = null!;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}