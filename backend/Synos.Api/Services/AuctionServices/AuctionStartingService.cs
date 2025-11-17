using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;

namespace Synos.Api.Services.AuctionServices;

public class AuctionStartingService : BackgroundService
{
    private readonly ILogger<AuctionStartingService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public AuctionStartingService(ILogger<AuctionStartingService> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Auction Starting Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessStartingAuctionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing starting auctions.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Auction Starting Service is stopping.");
    }

    private async Task ProcessStartingAuctionsAsync()
    {
        _logger.LogInformation("Checking for scheduled auctions to start...");

        using var scope = _scopeFactory.CreateScope();
        var auctionRepository = scope.ServiceProvider.GetRequiredService<IAuctionRepository>();

        var currentTime = TimeUtils.GetCurrentTime();
        var scheduledAuctions = await auctionRepository.GetScheduledAuctionsAsync();
        var auctionsToStart = scheduledAuctions.Where(a => a.StartTime <= currentTime && a.Status == AuctionStatus.Scheduled);

        foreach (var auction in auctionsToStart)
        {
            _logger.LogInformation("Starting auction {AuctionId}", auction.Id);
            auction.Status = AuctionStatus.Running;
            await auctionRepository.UpdateAuctionAsync(auction.Id, auction);
            _logger.LogInformation("Auction {AuctionId} status changed to Running.", auction.Id);
        }

        if (auctionsToStart.Any())
        {
            _logger.LogInformation("Processed {Count} scheduled auctions to start.", auctionsToStart.Count());
        }
    }
}
