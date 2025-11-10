namespace Synos.Api.Models.AuctionDataModels;

public class BidData
{
    public long MemberId { get; set; }
    public required string MemberName { get; set; }
    public decimal Amount { get; set; }
    public DateTime Timestamp { get; set; }
}
