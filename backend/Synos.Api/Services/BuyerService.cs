using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;
using System.Text.Json;

namespace Synos.Api.Services
{
    public class BuyerService : IBuyerService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IArtworkRepository _artworkRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IVnPayService _vnPayService;
        private readonly ILogger<BuyerService> _logger;
        private readonly IAuctionRepository _auctionRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public BuyerService(
            IOrderRepository orderRepository,
            IArtworkRepository artworkRepository,
            IMemberRepository memberRepository,
            IVnPayService vnPayService,
            ILogger<BuyerService> logger,
            IAuctionRepository auctionRepository,
            IWebHostEnvironment webHostEnvironment)
        {
            _orderRepository = orderRepository;
            _artworkRepository = artworkRepository;
            _memberRepository = memberRepository;
            _vnPayService = vnPayService;
            _logger = logger;
            _auctionRepository = auctionRepository;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IEnumerable<OrderResponseDto>> GetPurchaseHistoryAsync(long buyerId)
        {
            var orders = await _orderRepository.GetOrdersByMemberIdAsync(buyerId);
            return orders.Select(MapOrderToDto);
        }

        public async Task<OrderResponseDto?> PlaceOrderAsync(long buyerId, CreateOrderDto createOrderDto)
        {
            var member = await _memberRepository.GetMemberByIdAsync(buyerId);
            if (member == null || member.Role == MemberRole.Seller)
            {
                // Returning null to indicate a forbidden action
                return null;
            }

            var artwork = await _artworkRepository.GetArtworkByIdAsync(createOrderDto.ArtworkId);
            if (artwork == null || artwork.Status != ArtworkStatus.Available || artwork.IsFor != ArtworkFor.Fixed)
            {
                // Returning null to indicate a bad request
                return null;
            }

            var currentTime = TimeUtils.GetCurrentTime();
            var order = new Order
            {
                UserId = buyerId,
                OrderNumber = $"SYN{currentTime:yyyyMMddHHmmss}{new Random().Next(100, 999)}",
                TotalAmount = artwork.FixedPrice ?? 0,
                Status = OrderStatus.Pending,
                PaymentType = "VNPay",
                PaymentTime = currentTime,
                CreatedAt = currentTime,
                UpdatedAt = currentTime,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        ArtworkId = artwork.Id,
                        Total = artwork.FixedPrice ?? 0,
                    }
                }
            };

            var createdOrder = await _orderRepository.CreateOrderAsync(order);
            
            // Mark artwork as Reserved when order is created
            artwork.Status = ArtworkStatus.Reserved;
            await _artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);
            
            var fullOrder = await _orderRepository.GetOrderByIdAsync(createdOrder.Id);
            return fullOrder != null ? MapOrderToDto(fullOrder) : null;
        }

        public async Task<string?> InitiatePaymentAsync(long buyerId, long orderId, HttpContext httpContext)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.UserId != buyerId)
            {
                // Returning null for not found or forbidden
                return null;
            }

            if (order.Status != OrderStatus.Pending)
            {
                // Returning null for bad request
                return null;
            }

            var paymentRequest = new VnPayPaymentRequestDto
            {
                OrderId = order.Id,
                Amount = order.TotalAmount,
                OrderInfo = $"Payment for order {order.OrderNumber}"
            };

            return _vnPayService.CreatePaymentUrl(paymentRequest, httpContext);
        }

        public Task<VnPayReturnDto> ProcessVnPayReturnAsync(IQueryCollection collections)
        {
            var response = _vnPayService.ProcessIpn(collections); // Use the same validation logic for the return URL
            var txnRef = collections["vnp_TxnRef"].FirstOrDefault() ?? string.Empty;
            var amount = collections["vnp_Amount"].FirstOrDefault() ?? string.Empty;

            long.TryParse(txnRef, out var orderId);
            long.TryParse(amount, out var amountValue);

            var returnDto = new VnPayReturnDto
            {
                Success = response.RspCode == "00",
                OrderId = orderId.ToString(),
                Amount = (amountValue / 100).ToString()
            };

            if (returnDto.Success)
            {
                _logger.LogInformation("VNPay return successful for order {OrderId}. User redirected.", orderId);
            }
            else
            {
                _logger.LogWarning("VNPay return failed for order {OrderId}. User redirected. Response code: {ResponseCode}", orderId, response.RspCode);
            }

            return Task.FromResult(returnDto);
        }

        public async Task<VnPayIpnResponseDto> ProcessVnPayIpnAsync(IQueryCollection collections)
        {
            _logger.LogInformation("Received VNPay IPN.");
            var ipnResponse = _vnPayService.ProcessIpn(collections);

            try
            {
                var txnRef = collections["vnp_TxnRef"].FirstOrDefault() ?? string.Empty;
                var amount = collections["vnp_Amount"].FirstOrDefault() ?? string.Empty;
        
                long.TryParse(txnRef, out var orderId);
                long.TryParse(amount, out var vnpayAmount); // Amount is in pennies (dong * 100)

                if (orderId <= 0)
                {
                    _logger.LogError("Invalid OrderId in IPN: {OrderId}", txnRef);
                    return new VnPayIpnResponseDto { RspCode = "01", Message = "Order not found" };
                }
                
                // 1. Check signature
                if (ipnResponse.RspCode != "00" && ipnResponse.RspCode != "97") // "97" is our custom code for invalid signature
                {
                     // This case should ideally not happen if ProcessIpn is correct, but as a safeguard.
                    _logger.LogWarning("VNPay IPN signature validation failed for order {OrderId}.", orderId);
                    return new VnPayIpnResponseDto { RspCode = "97", Message = "Invalid Signature" };
                }

                var order = await _orderRepository.GetOrderByIdAsync(orderId);

                // 2. Check if order exists
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for VNPay IPN.", orderId);
                    return new VnPayIpnResponseDto { RspCode = "01", Message = "Order not found" };
                }

                // 3. Check if order amount is correct
                if ((long)order.TotalAmount * 100 != vnpayAmount)
                {
                    _logger.LogError("Mismatched amount for order {OrderId}. Expected: {ExpectedAmount}, Actual: {ActualAmount}", orderId, (long)order.TotalAmount * 100, vnpayAmount);
                    return new VnPayIpnResponseDto { RspCode = "04", Message = "Invalid amount" };
                }

                // 4. Check order status (only process if it's still Pending)
                if (order.Status != OrderStatus.Pending)
                {
                    // If already paid, it might be a duplicate IPN. We can just acknowledge it as successful.
                    if (order.Status == OrderStatus.Paid)
                    {
                        _logger.LogInformation("Duplicate IPN for already paid order {OrderId}. Acknowledging success.", orderId);
                        return new VnPayIpnResponseDto { RspCode = "00", Message = "Confirm Success" };
                    }
                    // If it's any other status (e.g., Cancelled), it's an invalid request.
                    _logger.LogWarning("IPN received for order {OrderId} with invalid status: {OrderStatus}", orderId, order.Status);
                    return new VnPayIpnResponseDto { RspCode = "02", Message = "Order already confirmed" };
                }

                // 5. Process based on VNPAY response code
                if (collections["vnp_ResponseCode"] == "00") // Payment successful
                {
                    _logger.LogInformation("VNPay IPN payment successful for order {OrderId}", orderId);
                    await _orderRepository.UpdateOrderStatusAsync(orderId, OrderStatus.Paid);
                    
                    // Update artwork status to Sold when payment is completed
                    await UpdateArtworkStatusAfterPayment(orderId);
                    
                    _logger.LogInformation("Order {OrderId} status updated to Paid via IPN", orderId);
                }
                else // Payment failed
                {
                    _logger.LogWarning("VNPay IPN payment failed for order {OrderId}. Response code: {ResponseCode}", orderId, collections["vnp_ResponseCode"]);
                    await _orderRepository.UpdateOrderStatusAsync(orderId, OrderStatus.Cancelled);
                    
                    // Release artwork back to available status when payment fails
                    await ReleaseArtworkFromOrder(orderId);
                }

                return new VnPayIpnResponseDto { RspCode = "00", Message = "Confirm Success" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during VNPay IPN processing.");
                // Return a generic error to VNPAY so it knows something went wrong on our end.
                return new VnPayIpnResponseDto { RspCode = "99", Message = "Unknown error" };
            }
        }

        // Auction Methods
        public async Task<IEnumerable<Auction>> GetActiveAuctionsAsync()
        {
            return await _auctionRepository.GetActiveAuctionsAsync();
        }

        public async Task<AuctionDetailDto?> GetAuctionDetailsAsync(long auctionId)
        {
            var auction = await _auctionRepository.GetAuctionByIdAsync(auctionId);
            if (auction == null)
                return null;

            // Get bid count and highest bid from JSON file
            int totalBids = 0;
            decimal? currentHighestBid = null;

            try
            {
                var auctionDataPath = Path.Combine(_webHostEnvironment.ContentRootPath, "AuctionData");
                var bidsFilePath = Path.Combine(auctionDataPath, $"{auctionId}.json");
                
                if (File.Exists(bidsFilePath))
                {
                    var bidsJson = await File.ReadAllTextAsync(bidsFilePath);
                    var bids = JsonSerializer.Deserialize<JsonElement>(bidsJson);
                    
                    totalBids = bids.GetArrayLength();
                    
                    foreach (var bid in bids.EnumerateArray())
                    {
                        if (bid.TryGetProperty("amount", out var amountProp))
                        {
                            var amount = amountProp.GetDecimal();
                            if (!currentHighestBid.HasValue || amount > currentHighestBid.Value)
                            {
                                currentHighestBid = amount;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading bid data for auction {AuctionId}", auctionId);
            }

            return new AuctionDetailDto
            {
                Id = auction.Id,
                ArtworkId = auction.ArtworkId,
                StartTime = auction.StartTime,
                EndTime = auction.EndTime,
                StartingPrice = auction.StartingPrice,
                ReservePrice = auction.ReservePrice,
                MinimumIncrement = auction.MinimumIncrement,
                Status = auction.Status.ToString(),
                WinnerBidId = auction.WinnerBidId,
                CreatedAt = auction.CreatedAt,
                TotalBids = totalBids,
                CurrentHighestBid = currentHighestBid,
                Artwork = auction.Artwork == null ? null : new AuctionArtworkDto
                {
                    Id = auction.Artwork.Id,
                    Title = auction.Artwork.Title,
                    Description = auction.Artwork.Description ?? string.Empty,
                    CreationYear = auction.Artwork.CreationYear ?? 0,
                    Dimensions = auction.Artwork.Dimensions ?? string.Empty,
                    Condition = auction.Artwork.Condition.ToString(),
                    Currency = auction.Artwork.Currency,
                    Status = auction.Artwork.Status.ToString(),
                    CategoryName = auction.Artwork.Category?.Name ?? "Uncategorized",
                    Seller = new AuctionSellerDto
                    {
                        Id = auction.Artwork.Seller.Id,
                        FullName = auction.Artwork.Seller.FullName,
                        Bio = auction.Artwork.Seller.Bio,
                        ProfileImage = auction.Artwork.Seller.ProfileImage
                    },
                    ArtworkImages = auction.Artwork.ArtworkImages.Where(img => img.DeletedAt == null).Select(img => new ArtworkImageDto
                    {
                        Id = img.Id,
                        ImageUrl = img.FilePath,
                        IsPrimary = img.IsPrimary,
                        UploadedAt = img.UploadedAt
                    }).ToList()
                }
            };
        }

        public async Task<bool> PlaceBidAsync(long auctionId, long memberId, decimal amount)
        {
            var auction = await _auctionRepository.GetAuctionByIdAsync(auctionId);
            if (auction == null || auction.EndTime <= TimeUtils.GetCurrentTime() || auction.Status != AuctionStatus.Running)
            {
                return false; // Auction not found, has ended, or not running
            }

            var member = await _memberRepository.GetMemberByIdAsync(memberId);
            if (member == null)
            {
                return false; // Member not found
            }

            // Ensure AuctionData folder exists
            var auctionDataPath = Path.Combine(_webHostEnvironment.ContentRootPath, "AuctionData");
            if (!Directory.Exists(auctionDataPath))
            {
                Directory.CreateDirectory(auctionDataPath);
            }

            // Get current bids from JSON file (file name is just the auction ID)
            var bidsFilePath = Path.Combine(auctionDataPath, $"{auctionId}.json");
            var currentBids = new List<object>();
            decimal highestBid = auction.StartingPrice;

            if (File.Exists(bidsFilePath))
            {
                var existingData = await File.ReadAllTextAsync(bidsFilePath);
                var bidsArray = JsonSerializer.Deserialize<JsonElement>(existingData);
                
                foreach (var bid in bidsArray.EnumerateArray())
                {
                    if (bid.TryGetProperty("amount", out var amountProp))
                    {
                        var bidAmount = amountProp.GetDecimal();
                        if (bidAmount > highestBid)
                        {
                            highestBid = bidAmount;
                        }
                    }
                    var deserializedBid = JsonSerializer.Deserialize<object>(bid.GetRawText());
                    if (deserializedBid != null)
                    {
                        currentBids.Add(deserializedBid);
                    }
                }
            }

            // Validate bid amount (must be higher than current highest bid and meet minimum increment)
            if (amount <= highestBid || amount < auction.StartingPrice + auction.MinimumIncrement)
            {
                return false; // Bid not high enough
            }

            // Add new bid with simplified structure: buyerId, amount, time
            var newBid = new
            {
                buyerId = memberId,
                amount = amount,
                time = TimeUtils.GetCurrentTime()
            };

            currentBids.Add(newBid);

            // Save updated bids array to JSON file
            await File.WriteAllTextAsync(bidsFilePath, JsonSerializer.Serialize(currentBids, new JsonSerializerOptions { WriteIndented = true }));
            return true;
        }

        private async Task UpdateArtworkStatusAfterPayment(long orderId)
        {
            try
            {
                // Get order items to find the artworks
                var orderItems = await _orderRepository.GetOrderItemsByOrderIdAsync(orderId);
                
                foreach (var orderItem in orderItems)
                {
                    var artwork = await _artworkRepository.GetArtworkByIdAsync(orderItem.ArtworkId);
                    if (artwork != null)
                    {
                        // Update artwork status from Reserved to Sold
                        artwork.Status = ArtworkStatus.Sold;
                        artwork.UpdatedAt = TimeUtils.GetCurrentTime();
                        await _artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);
                        
                        _logger.LogInformation("Artwork {ArtworkId} status updated to Sold after payment for order {OrderId}", 
                            artwork.Id, orderId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating artwork status after payment for order {OrderId}", orderId);
            }
        }

        private async Task ReleaseArtworkFromOrder(long orderId)
        {
            try
            {
                // Get order items to find the artworks
                var orderItems = await _orderRepository.GetOrderItemsByOrderIdAsync(orderId);
                
                foreach (var orderItem in orderItems)
                {
                    var artwork = await _artworkRepository.GetArtworkByIdAsync(orderItem.ArtworkId);
                    if (artwork != null && artwork.Status == ArtworkStatus.Reserved)
                    {
                        // Release artwork back to Available status
                        artwork.Status = ArtworkStatus.Available;
                        artwork.UpdatedAt = TimeUtils.GetCurrentTime();
                        await _artworkRepository.UpdateArtworkAsync(artwork.Id, artwork);
                        
                        _logger.LogInformation("Artwork {ArtworkId} released back to Available after order {OrderId} cancellation", 
                            artwork.Id, orderId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error releasing artwork for cancelled order {OrderId}", orderId);
            }
        }

        private OrderResponseDto MapOrderToDto(Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                Currency = order.Currency,
                PaymentType = order.PaymentType,
                Status = order.Status.ToString(),
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems?.Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    ArtworkId = item.ArtworkId,
                    Total = item.Total,
                    ArtworkTitle = item.Artwork?.Title ?? "N/A",
                    ArtworkImageUrl = item.Artwork?.ArtworkImages?.FirstOrDefault(i => i.IsPrimary)?.FilePath ?? string.Empty
                }).ToList() ?? new List<OrderItemDto>()
            };
        }
    }
}