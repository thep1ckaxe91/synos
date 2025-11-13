using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Synos.Api.Utils;

namespace Synos.Api.Models
{
    public enum AuctionStatus
    {
        Scheduled,
        Running,
        Ended
    }

    [Table("auctions")]
    public class Auction
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("artwork_id")]
        public long ArtworkId { get; set; }

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("starting_price", TypeName = "decimal(18,4)")]
        public decimal StartingPrice { get; set; }

        [Column("reserve_price", TypeName = "decimal(18,4)")]
        public decimal? ReservePrice { get; set; }

        [Column("minimum_increment", TypeName = "decimal(18,4)")]
        public decimal MinimumIncrement { get; set; } = 1;

        [Column("status")]
        public AuctionStatus Status { get; set; } = AuctionStatus.Scheduled;

        [Column("winner_bid_id")]
        public long? WinnerBidId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = TimeUtils.GetCurrentTime();

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("ArtworkId")]
        public virtual Artwork Artwork { get; set; } = null!;

        [ForeignKey("WinnerBidId")]
        public virtual Member? WinnerBid { get; set; }
    }
}