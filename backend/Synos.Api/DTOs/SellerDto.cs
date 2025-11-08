using System.ComponentModel.DataAnnotations;
using Synos.Api.Models;

namespace Synos.Api.DTOs
{
    public enum SaleTypeDto
    {
        FixedPrice,
        Auction
    }

    public enum ArtworkStatusDto
    {
        PendingApproval,
        Approved,
        Rejected,
        Sold
    }

    public class CreateArtworkDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        [Required]
        public SaleTypeDto SaleType { get; set; }
        [Required]
        public long CategoryId { get; set; }
        // For simplicity, we'll handle image uploads separately or assume URLs are provided.
        // In a real-world scenario, this might be a List<IFormFile>.
        public List<string> ImageUrls { get; set; } = new();
    }

    public class SellerArtworkDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string SaleType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? PrimaryImage { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class SalesHistoryDto
    {
        public long OrderId { get; set; }
        public string ArtworkTitle { get; set; } = string.Empty;
        public string? PrimaryImage { get; set; }
        public DateTime SoldAt { get; set; }
        public decimal SalePrice { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal PayoutAmount { get; set; }
        public string BuyerName { get; set; } = string.Empty;
    }
}
