using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;

namespace Synos.Api.Services.AuctionServices;

public class OrderExpirationService : BackgroundService
{
    private readonly ILogger<OrderExpirationService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(30); // Check every 30 minutes
    private readonly TimeSpan _paymentTimeout = TimeSpan.FromHours(24); // 24 hours to pay

    public OrderExpirationService(ILogger<OrderExpirationService> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Order Expiration Service is starting. Payment timeout: {Timeout} hours", _paymentTimeout.TotalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpiredOrdersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing expired orders.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Order Expiration Service is stopping.");
    }

    private async Task ProcessExpiredOrdersAsync()
    {
        _logger.LogInformation("Checking for expired orders...");

        using var scope = _scopeFactory.CreateScope();
        var orderRepository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
        var artworkRepository = scope.ServiceProvider.GetRequiredService<IArtworkRepository>();

        var currentTime = TimeUtils.GetCurrentTime();
        var expiredCutoff = currentTime - _paymentTimeout;

        // Get all pending orders
        var pendingOrders = await orderRepository.GetOrdersByStatusAsync(OrderStatus.Pending);
        
        // Find orders that have expired (older than payment timeout)
        var expiredOrders = pendingOrders.Where(o => o.CreatedAt < expiredCutoff);

        foreach (var order in expiredOrders)
        {
            _logger.LogInformation("Processing expired order {OrderId} created at {CreatedAt}", 
                order.Id, order.CreatedAt);

            try
            {
                // Cancel the expired order
                await orderRepository.UpdateOrderStatusAsync(order.Id, OrderStatus.Cancelled);

                // Get order items and make artworks available again
                var orderItems = await orderRepository.GetOrderItemsByOrderIdAsync(order.Id);
                
                foreach (var orderItem in orderItems)
                {
                    var artwork = await artworkRepository.GetArtworkByIdAsync(orderItem.ArtworkId);
                    if (artwork != null && artwork.Status == ArtworkStatus.Reserved)
                    {
                        // Make artwork available again
                        artwork.Status = ArtworkStatus.Available;
                        artwork.UpdatedAt = currentTime;
                        await artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);
                        
                        _logger.LogInformation("Artwork {ArtworkId} made available again after order {OrderId} expired", 
                            artwork.Id, order.Id);
                    }
                }

                _logger.LogInformation("Successfully processed expired order {OrderId}", order.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing expired order {OrderId}", order.Id);
            }
        }

        if (expiredOrders.Any())
        {
            _logger.LogInformation("Processed {Count} expired orders", expiredOrders.Count());
        }
    }
}