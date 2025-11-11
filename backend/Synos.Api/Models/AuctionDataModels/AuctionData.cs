namespace Synos.Api.Models.AuctionDataModels;

public class AuctionData
{
    public long AuctionId { get; set; }
    public long ArtworkId { get; set; }
    public required string ArtworkName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal StartingPrice { get; set; }
    public List<BidData> Bids { get; set; } = new();
}
