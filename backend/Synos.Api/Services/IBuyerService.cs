using Microsoft.AspNetCore.Mvc;
using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Models.AuctionDataModels;

namespace Synos.Api.Services
{
    public interface IBuyerService
    {
        Task<IEnumerable<Order>> GetPurchaseHistoryAsync(long buyerId);
        Task<Order?> PlaceOrderAsync(long buyerId, CreateOrderDto createOrderDto);
        string? InitiatePaymentAsync(long buyerId, long orderId, HttpContext httpContext); // Changed return type
        Task<VnPayReturnDto> ProcessVnPayReturnAsync(IQueryCollection collections);
        Task<VnPayIpnResponseDto> ProcessVnPayIpnAsync(IQueryCollection collections);

        // Auction methods
        Task<IEnumerable<AuctionData>> GetActiveAuctionsAsync();
        Task<AuctionData?> GetAuctionDetailsAsync(long auctionId);
        Task<bool> PlaceBidAsync(long auctionId, long memberId, decimal amount);
    }
}