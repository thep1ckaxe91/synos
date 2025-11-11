using Synos.Api.Models; // Added for AuctionStatus enum
using Synos.Api.Models.AuctionDataModels;
using Synos.Api.Repositories;
using Synos.Api.Services.AuctionServices;

namespace Synos.Api.Services.AuctionServices;

public class AuctionProcessorService : BackgroundService
{
    private readonly ILogger<AuctionProcessorService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public AuctionProcessorService(ILogger<AuctionProcessorService> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Auction Processor Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessEndedAuctionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing ended auctions.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Auction Processor Service is stopping.");
    }

    private async Task ProcessEndedAuctionsAsync()
    {
        _logger.LogInformation("Checking for ended auctions...");

        using var scope = _scopeFactory.CreateScope();
        var auctionFileManager = scope.ServiceProvider.GetRequiredService<IAuctionFileManagerService>();
        var auctionRepository = scope.ServiceProvider.GetRequiredService<IAuctionRepository>();

        var activeAuctions = await auctionFileManager.GetAllActiveAuctionsAsync();

        foreach (var auctionData in activeAuctions)
        {
            if (auctionData.EndTime <= DateTime.UtcNow)
            {
                _logger.LogInformation("Auction {AuctionId} has ended. Processing...", auctionData.AuctionId);

                var winningBid = auctionData.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();

                var dbAuction = await auctionRepository.GetAuctionByIdAsync(auctionData.AuctionId);

                if (dbAuction != null)
                {
                    if (winningBid != null)
                    {
                        dbAuction.WinnerBidId = winningBid.MemberId; // Changed to WinnerBidId
                        // dbAuction.FinalPrice = winningBid.Amount; // Removed as FinalPrice is not in Auction model
                        dbAuction.Status = AuctionStatus.Ended; // Changed to enum
                    }
                    else
                    {
                        dbAuction.Status = AuctionStatus.Ended; // Changed to enum (No bids)
                    }
                    
                    await auctionRepository.UpdateAuctionAsync(dbAuction.Id, dbAuction); // Corrected call
                    _logger.LogInformation("Updated auction {AuctionId} in database. WinnerBidId: {WinnerBidId}, FinalPrice (from JSON): {FinalPrice}", dbAuction.Id, dbAuction.WinnerBidId, winningBid?.Amount); // Updated log
                }

                auctionFileManager.DeleteAuctionFile(auctionData.AuctionId);
                _logger.LogInformation("Deleted auction file for {AuctionId}.", auctionData.AuctionId);
            }
        }
    }
}
