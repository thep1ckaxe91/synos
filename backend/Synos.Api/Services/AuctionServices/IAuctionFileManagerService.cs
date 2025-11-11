using Synos.Api.Models;
using Synos.Api.Models.AuctionDataModels;

namespace Synos.Api.Services.AuctionServices;

public interface IAuctionFileManagerService
{
    Task<AuctionData> CreateAuctionFileAsync(Auction auction);
    Task<IEnumerable<AuctionData>> GetAllActiveAuctionsAsync();
    Task<AuctionData?> GetAuctionDetailsAsync(long auctionId);
    Task AddBidAsync(long auctionId, BidData bid);
    void DeleteAuctionFile(long auctionId);
}
