using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;
using System.Text.Json;

namespace Synos.Api.Services.AuctionServices;

public class AuctionEndingService : BackgroundService
{
    private readonly ILogger<AuctionEndingService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public AuctionEndingService(ILogger<AuctionEndingService> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Auction Ending Service is starting.");

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

        _logger.LogInformation("Auction Ending Service is stopping.");
    }

    private async Task ProcessEndedAuctionsAsync()
    {
        _logger.LogInformation("Checking for ended auctions...");

        using var scope = _scopeFactory.CreateScope();
        var auctionRepository = scope.ServiceProvider.GetRequiredService<IAuctionRepository>();
        var memberRepository = scope.ServiceProvider.GetRequiredService<IMemberRepository>();
        var artworkRepository = scope.ServiceProvider.GetRequiredService<IArtworkRepository>();
        var orderRepository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
        var webHostEnvironment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

        // Ensure AuctionData folder exists
        var auctionDataPath = Path.Combine(webHostEnvironment.ContentRootPath, "AuctionData");
        if (!Directory.Exists(auctionDataPath))
        {
            Directory.CreateDirectory(auctionDataPath);
        }

        // Get all running auctions that have ended
        var runningAuctions = await auctionRepository.GetActiveAuctionsAsync();
        var currentTime = TimeUtils.GetCurrentTime();
        var endedAuctions = runningAuctions.Where(a => a.EndTime <= currentTime && a.Status == AuctionStatus.Running);

        foreach (var auction in endedAuctions)
        {
            _logger.LogInformation("Processing ended auction {AuctionId}", auction.Id);

            // Read bids from JSON file
            var bidsFilePath = Path.Combine(auctionDataPath, $"{auction.Id}.json");
            
            if (File.Exists(bidsFilePath))
            {
                var bidsJson = await File.ReadAllTextAsync(bidsFilePath);
                var bids = JsonSerializer.Deserialize<JsonElement>(bidsJson);

                // Find highest bid
                long? winnerId = null;
                decimal highestAmount = 0;
                DateTime? winningTime = null;

                foreach (var bid in bids.EnumerateArray())
                {
                    if (bid.TryGetProperty("buyerId", out var buyerIdProp) && 
                        bid.TryGetProperty("amount", out var amountProp))
                    {
                        var amount = amountProp.GetDecimal();
                        if (amount > highestAmount)
                        {
                            highestAmount = amount;
                            winnerId = buyerIdProp.GetInt64();
                            if (bid.TryGetProperty("time", out var timeProp))
                            {
                                winningTime = timeProp.GetDateTime();
                            }
                        }
                    }
                }

                // Update auction with winner
                auction.Status = AuctionStatus.Ended;
                auction.WinnerBidId = winnerId;

                await auctionRepository.UpdateAuctionAsync(auction.Id, auction);

                if (winnerId.HasValue)
                {
                    // Create winning bid details file
                    var winner = await memberRepository.GetMemberByIdAsync(winnerId.Value);
                    var winningBidDetails = new
                    {
                        auctionId = auction.Id,
                        artworkId = auction.ArtworkId,
                        winnerId = winnerId.Value,
                        winnerName = winner?.FullName ?? "Unknown",
                        winnerEmail = winner?.Email ?? "Unknown",
                        winningAmount = highestAmount,
                        winningTime = winningTime,
                        auctionEndTime = auction.EndTime,
                        reservePrice = auction.ReservePrice,
                        reserveMet = auction.ReservePrice.HasValue ? highestAmount >= auction.ReservePrice.Value : true
                    };

                    var winnerFilePath = Path.Combine(auctionDataPath, $"winner_{auction.Id}.json");
                    await File.WriteAllTextAsync(winnerFilePath, JsonSerializer.Serialize(winningBidDetails, new JsonSerializerOptions { WriteIndented = true }));

                    // Create an order for the winning bidder
                    await CreateOrderForWinnerAsync(auction, winnerId.Value, highestAmount, artworkRepository, orderRepository, winner);

                    _logger.LogInformation("Auction {AuctionId} ended. Winner: {WinnerId}, Amount: {Amount}", 
                        auction.Id, winnerId.Value, highestAmount);
                }
                else
                {
                    _logger.LogInformation("Auction {AuctionId} ended with no bids", auction.Id);
                }

                // Delete bidding history file
                File.Delete(bidsFilePath);
                _logger.LogInformation("Deleted bidding history for auction {AuctionId}", auction.Id);
            }
            else
            {
                // No bids file found, just mark as ended
                auction.Status = AuctionStatus.Ended;
                await auctionRepository.UpdateAuctionAsync(auction.Id, auction);
                _logger.LogInformation("Auction {AuctionId} ended with no bids file", auction.Id);
            }
        }
    }

    private async Task CreateOrderForWinnerAsync(
        Auction auction, 
        long winnerId, 
        decimal winningAmount, 
        IArtworkRepository artworkRepository,
        IOrderRepository orderRepository, 
        Member? winner)
    {
        try
        {
            // Get the artwork details
            var artwork = await artworkRepository.GetArtworkByIdAsync(auction.ArtworkId);
            if (artwork == null)
            {
                _logger.LogError("Could not find artwork {ArtworkId} for auction {AuctionId}", auction.ArtworkId, auction.Id);
                return;
            }

            // Create the order for the winner with payment timeout
            var currentTime = TimeUtils.GetCurrentTime();
            var order = new Order
            {
                UserId = winnerId,
                OrderNumber = $"AUC-{auction.Id}-{currentTime:yyyyMMddHHmmss}",
                Status = OrderStatus.Pending, // Winner needs to pay
                TotalAmount = winningAmount,
                PaymentType = "VNPay",
                PaymentTime = currentTime
            };

            var createdOrder = await orderRepository.CreateOrderAsync(order);

            if (createdOrder != null)
            {
                // Create order item
                var orderItem = new OrderItem
                {
                    OrderId = createdOrder.Id,
                    ArtworkId = auction.ArtworkId,
                    Total = winningAmount
                };

                await orderRepository.AddOrderItemAsync(orderItem);

                // Update artwork status to reserved (winner needs to pay)
                artwork.Status = ArtworkStatus.Reserved;
                await artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);

                _logger.LogInformation("Created order {OrderId} for auction winner {WinnerId} - Auction {AuctionId}", 
                    createdOrder.Id, winnerId, auction.Id);
            }
            else
            {
                _logger.LogError("Failed to create order for auction winner {WinnerId} - Auction {AuctionId}", winnerId, auction.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order for auction winner {WinnerId} - Auction {AuctionId}", winnerId, auction.Id);
        }
    }
}