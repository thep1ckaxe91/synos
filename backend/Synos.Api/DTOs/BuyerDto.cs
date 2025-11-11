using System.ComponentModel.DataAnnotations;

namespace Synos.Api.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public long ArtworkId { get; set; }
    }

    public class VnPayReturnDto
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
    }

    public class OrderResponseDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
    }

    public class OrderItemDto
    {
        public long Id { get; set; }
        public long ArtworkId { get; set; }
        public decimal Total { get; set; }
        public string ArtworkTitle { get; set; } = string.Empty;
        public string ArtworkImageUrl { get; set; } = string.Empty;
    }
}
