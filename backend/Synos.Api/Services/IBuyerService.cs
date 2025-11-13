using Microsoft.AspNetCore.Mvc;
using Synos.Api.DTOs;
using Synos.Api.Models;

namespace Synos.Api.Services
{
    public interface IBuyerService
    {
        Task<IEnumerable<OrderResponseDto>> GetPurchaseHistoryAsync(long buyerId);
        Task<OrderResponseDto?> PlaceOrderAsync(long buyerId, CreateOrderDto createOrderDto);
        Task<string?> InitiatePaymentAsync(long buyerId, long orderId, HttpContext httpContext);
        Task<VnPayReturnDto> ProcessVnPayReturnAsync(IQueryCollection collections);
        Task<VnPayIpnResponseDto> ProcessVnPayIpnAsync(IQueryCollection collections);

        // Auction methods
        Task<IEnumerable<Auction>> GetActiveAuctionsAsync();
        Task<AuctionDetailDto?> GetAuctionDetailsAsync(long auctionId);
        Task<bool> PlaceBidAsync(long auctionId, long memberId, decimal amount);
    }
}