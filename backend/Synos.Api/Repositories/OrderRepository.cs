using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(long id)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.Commissions)
                .FirstOrDefaultAsync(o => o.Id == id && o.DeletedAt == null);
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(long userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(o => o.UserId == userId && o.DeletedAt == null)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersBySellerIdAsync(long sellerId)
        {
            return await _context.Orders
                .Include(o => o.User) // This is the buyer
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(o => o.OrderItems.Any(oi => oi.Artwork.SellerId == sellerId) && o.DeletedAt == null)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersByStatusAsync(OrderStatus status)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.Status == status && o.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByOrderNumberAsync(string orderNumber)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.DeletedAt == null);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<Order?> UpdateOrderAsync(long id, Order order)
        {
            var existingOrder = await GetOrderByIdAsync(id);
            if (existingOrder == null)
                return null;

            existingOrder.Status = order.Status;
            existingOrder.PaymentType = order.PaymentType;
            existingOrder.PaymentTime = order.PaymentTime;
            existingOrder.TotalAmount = order.TotalAmount;
            existingOrder.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return existingOrder;
        }

        public async Task<bool> DeleteOrderAsync(long id)
        {
            var order = await GetOrderByIdAsync(id);
            if (order == null)
                return false;

            order.DeletedAt = TimeUtils.GetDeleteTimestamp();
            order.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<OrderItem> AddOrderItemAsync(OrderItem orderItem)
        {
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync();
            return orderItem;
        }

        public async Task<bool> RemoveOrderItemAsync(long orderItemId)
        {
            var orderItem = await _context.OrderItems.FindAsync(orderItemId);
            if (orderItem == null)
                return false;

            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<OrderItem>> GetOrderItemsByOrderIdAsync(long orderId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Artwork)
                    .ThenInclude(a => a.ArtworkImages)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();
        }

        public async Task<Order?> UpdateOrderStatusAsync(long orderId, OrderStatus status)
        {
            var order = await GetOrderByIdAsync(orderId);
            if (order == null)
                return null;

            order.Status = status;
            order.UpdatedAt = TimeUtils.GetUpdateTimestamp();

            if (status == OrderStatus.Paid)
            {
                order.PaymentTime = TimeUtils.GetUpdateTimestamp();

                foreach (var item in order.OrderItems)
                {
                    // Assuming one commission per artwork, get the most recent one.
                    var commission = item.Artwork.Commissions
                        .OrderByDescending(c => c.AppliedAt)
                        .FirstOrDefault();

                    if (commission != null)
                    {
                        item.CommissionRate = commission.Value; // Snapshot the rate

                        if (commission.CommissionType == CommissionType.Percentage)
                        {
                            item.CommissionAmount = item.Total * (commission.Value / 100);
                        }
                        else // Fixed amount
                        {
                            item.CommissionAmount = commission.Value;
                        }

                        item.SellerPayoutAmount = item.Total - item.CommissionAmount;
                    }
                    else
                    {
                        // If no commission rule is found, assume 0 commission
                        item.CommissionRate = 0;
                        item.CommissionAmount = 0;
                        item.SellerPayoutAmount = item.Total;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid && o.DeletedAt == null)
                .SumAsync(o => o.TotalAmount);
        }

        public async Task<int> GetOrderCountByStatusAsync(OrderStatus status)
        {
            return await _context.Orders
                .CountAsync(o => o.Status == status && o.DeletedAt == null);
        }

        // Missing interface methods
        public async Task<IEnumerable<Order>> GetOrdersByMemberIdAsync(long memberId)
        {
            return await GetOrdersByUserIdAsync(memberId);
        }

        public async Task<IEnumerable<Order>> GetPendingOrdersAsync()
        {
            return await GetOrdersByStatusAsync(OrderStatus.Pending);
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync(int skip = 0, int take = 50)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.DeletedAt == null)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate && o.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersByAmountRangeAsync(decimal minAmount, decimal maxAmount)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.TotalAmount >= minAmount && o.TotalAmount <= maxAmount && o.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<int> GetTotalOrdersCountAsync()
        {
            return await _context.Orders
                .CountAsync(o => o.DeletedAt == null);
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid && 
                           o.PaymentTime >= startDate && 
                           o.PaymentTime <= endDate &&
                           o.DeletedAt == null)
                .SumAsync(o => o.TotalAmount);
        }

        public async Task<int> GetOrdersCountByStatusAsync(OrderStatus status)
        {
            return await GetOrderCountByStatusAsync(status);
        }

        public async Task<IEnumerable<Order>> GetRecentOrdersAsync(int count = 10)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Artwork)
                .Where(o => o.DeletedAt == null)
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
