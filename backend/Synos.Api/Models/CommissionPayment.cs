using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    public enum PaymentStatus
    {
        Unpaid,
        Paid,
        Overdue,
        Failed
    }

    [Table("commission_payments")]
    public class CommissionPayment
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("seller_id")]
        public long SellerId { get; set; }

        [Column("order_item_id")]
        public long OrderItemId { get; set; }

        [Required]
        [Column("amount_owed", TypeName = "decimal(18,2)")]
        public decimal AmountOwed { get; set; }

        [Column("status")]
        public PaymentStatus Status { get; set; } = PaymentStatus.Unpaid;

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = TimeUtils.GetCurrentTime();
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("payment_gateway_txn_ref")]
        [MaxLength(255)]
        public string? PaymentGatewayTxnRef { get; set; }

        // Navigation properties
        [ForeignKey("SellerId")]
        public virtual Member Seller { get; set; } = null!;

        [ForeignKey("OrderItemId")]
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}
