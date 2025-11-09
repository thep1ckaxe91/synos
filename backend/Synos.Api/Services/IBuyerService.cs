using Microsoft.AspNetCore.Mvc;
using Synos.Api.DTOs;
using Synos.Api.Models;

namespace Synos.Api.Services
{
    public interface IBuyerService
    {
        Task<IEnumerable<Order>> GetPurchaseHistoryAsync(long buyerId);
        Task<Order?> PlaceOrderAsync(long buyerId, CreateOrderDto createOrderDto);
        Task<string?> InitiatePaymentAsync(long buyerId, long orderId, HttpContext httpContext);
        Task<VnPayReturnDto> ProcessVnPayReturnAsync(IQueryCollection collections);
        Task<VnPayIpnResponseDto> ProcessVnPayIpnAsync(IQueryCollection collections);
    }
}