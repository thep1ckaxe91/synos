using System.ComponentModel.DataAnnotations;

namespace Synos.Api.DTOs
{
    public class GuestArtworkDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public short? CreationYear { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public string? Material { get; set; }
        public decimal? Price { get; set; }
        public string ArtworkFor { get; set; } = string.Empty; // "Auction" or "Fixed"
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public List<GuestArtworkImageDto> Images { get; set; } = new List<GuestArtworkImageDto>();
    }

    public class GuestArtworkImageDto
    {
        public long Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class GuestExhibitionDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty; // "Upcoming", "Active", "Past"
        public int ArtworkCount { get; set; }
        public List<GuestArtworkDto> FeaturedArtworks { get; set; } = new List<GuestArtworkDto>();
    }

    public class GuestCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public int ArtworkCount { get; set; }
    }

    public class GuestSearchResultDto
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<GuestArtworkDto> Artworks { get; set; } = new List<GuestArtworkDto>();
    }

    public class GuestSearchRequestDto
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? ArtworkFor { get; set; } // "Auction", "Fixed", or null for all
        public string? SortBy { get; set; } = "CreatedAt"; // "Title", "Price", "CreatedAt"
        public string? SortOrder { get; set; } = "DESC"; // "ASC", "DESC"
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class GuestArtworkDetailDto : GuestArtworkDto
    {
        public string? SellerBio { get; set; }
        public GuestAuctionDto? AuctionDetails { get; set; }
        public List<GuestArtworkDto> RelatedArtworks { get; set; } = new List<GuestArtworkDto>();
    }

    public class GuestAuctionDto
    {
        public long Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal? ReservePrice { get; set; }
        public decimal MinimumIncrement { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? CurrentHighestBid { get; set; }
        public int BidCount { get; set; }
        public bool IsActive { get; set; }
        public TimeSpan? TimeRemaining { get; set; }
    }

    public class GuestStatisticsDto
    {
        public int TotalArtworks { get; set; }
        public int ActiveAuctions { get; set; }
        public int ActiveExhibitions { get; set; }
        public int TotalCategories { get; set; }
        public List<GuestArtworkDto> FeaturedArtworks { get; set; } = new List<GuestArtworkDto>();
        public List<GuestArtworkDto> RecentArtworks { get; set; } = new List<GuestArtworkDto>();
    }

    public class GuestExhibitionViewDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<GuestArtworkInExhibitionDto> Artworks { get; set; } = new();
    }

    public class GuestArtworkInExhibitionDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public string SellerName { get; set; } = string.Empty;
    }
}