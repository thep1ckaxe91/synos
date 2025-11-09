using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;

namespace Synos.Api.Services
{
    public class BuyerService : IBuyerService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IArtworkRepository _artworkRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IVnPayService _vnPayService;
        private readonly ILogger<BuyerService> _logger;

        public BuyerService(
            IOrderRepository orderRepository,
            IArtworkRepository artworkRepository,
            IMemberRepository memberRepository,
            IVnPayService vnPayService,
            ILogger<BuyerService> logger)
        {
            _orderRepository = orderRepository;
            _artworkRepository = artworkRepository;
            _memberRepository = memberRepository;
            _vnPayService = vnPayService;
            _logger = logger;
        }

        public async Task<IEnumerable<Order>> GetPurchaseHistoryAsync(long buyerId)
        {
            return await _orderRepository.GetOrdersByMemberIdAsync(buyerId);
        }

        public async Task<Order?> PlaceOrderAsync(long buyerId, CreateOrderDto createOrderDto)
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

            var order = new Order
            {
                UserId = buyerId,
                OrderNumber = $"SYN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(100, 999)}",
                TotalAmount = artwork.FixedPrice ?? 0,
                Status = OrderStatus.Pending,
                CreatedAt = TimeUtils.GetCurrentTime(),
                UpdatedAt = TimeUtils.GetCurrentTime(),
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
            return await _orderRepository.GetOrderByIdAsync(createdOrder.Id);
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

        public async Task<VnPayReturnDto> ProcessVnPayReturnAsync(IQueryCollection collections)
        {
            var response = _vnPayService.ProcessIpn(collections); // Use the same validation logic for the return URL
            long.TryParse(collections["vnp_TxnRef"], out var orderId);
            long.TryParse(collections["vnp_Amount"], out var amountValue);

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

            return returnDto;
        }

        public async Task<VnPayIpnResponseDto> ProcessVnPayIpnAsync(IQueryCollection collections)
        {
            _logger.LogInformation("Received VNPay IPN.");
            var ipnResponse = _vnPayService.ProcessIpn(collections);

            try
            {
                long.TryParse(collections["vnp_TxnRef"], out var orderId);
                long.TryParse(collections["vnp_Amount"], out var vnpayAmount); // Amount is in pennies (dong * 100)

                if (orderId <= 0)
                {
                    _logger.LogError("Invalid OrderId in IPN: {OrderId}", collections["vnp_TxnRef"].ToString());
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
                    _logger.LogInformation("Order {OrderId} status updated to Paid via IPN", orderId);
                }
                else // Payment failed
                {
                    _logger.LogWarning("VNPay IPN payment failed for order {OrderId}. Response code: {ResponseCode}", orderId, collections["vnp_ResponseCode"]);
                    await _orderRepository.UpdateOrderStatusAsync(orderId, OrderStatus.Cancelled);
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
    }
}