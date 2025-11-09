using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface IOrderRepository
    {
        // Basic Order Operations
        Task<Order?> GetOrderByIdAsync(long id);
        Task<IEnumerable<Order>> GetOrdersByMemberIdAsync(long memberId);
        Task<IEnumerable<Order>> GetOrdersBySellerIdAsync(long sellerId);
        Task<Order> CreateOrderAsync(Order order);
        Task<Order?> UpdateOrderAsync(long id, Order order);
        Task<bool> DeleteOrderAsync(long id);

        // Order Status Management
        Task<IEnumerable<Order>> GetOrdersByStatusAsync(OrderStatus status);
        Task<IEnumerable<Order>> GetPendingOrdersAsync();
        Task<Order?> UpdateOrderStatusAsync(long orderId, OrderStatus status);

        // Order Items
        Task<IEnumerable<OrderItem>> GetOrderItemsByOrderIdAsync(long orderId);
        Task<OrderItem> AddOrderItemAsync(OrderItem orderItem);
        Task<bool> RemoveOrderItemAsync(long orderItemId);

        // Admin Transaction Monitoring
        Task<IEnumerable<Order>> GetAllOrdersAsync(int skip = 0, int take = 50);
        Task<IEnumerable<Order>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Order>> GetOrdersByAmountRangeAsync(decimal minAmount, decimal maxAmount);
        Task<int> GetTotalOrdersCountAsync();
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate);

        // Statistics
        Task<int> GetOrdersCountByStatusAsync(OrderStatus status);
        Task<IEnumerable<Order>> GetRecentOrdersAsync(int count = 10);
    }
}
