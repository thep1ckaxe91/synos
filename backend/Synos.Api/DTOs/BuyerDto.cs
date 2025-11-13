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

    public class AuctionDetailDto
    {
        public long Id { get; set; }
        public long ArtworkId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal? ReservePrice { get; set; }
        public decimal MinimumIncrement { get; set; }
        public string Status { get; set; } = string.Empty;
        public long? WinnerBidId { get; set; }
        public DateTime CreatedAt { get; set; }
        public AuctionArtworkDto Artwork { get; set; } = new();
        public int TotalBids { get; set; }
        public decimal? CurrentHighestBid { get; set; }
    }

    public class AuctionArtworkDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CreationYear { get; set; }
        public string Dimensions { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public AuctionSellerDto Seller { get; set; } = new();
        public List<ArtworkImageDto> ArtworkImages { get; set; } = new();
        public string CategoryName { get; set; } = string.Empty;
    }

    public class AuctionSellerDto
    {
        public long Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
    }

}
