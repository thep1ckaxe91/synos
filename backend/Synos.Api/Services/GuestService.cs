using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;

namespace Synos.Api.Services
{
    public class GuestService : IGuestService
    {
        private readonly ApplicationDbContext _context;
        private readonly IArtworkRepository _artworkRepository;
        private readonly IExhibitionRepository _exhibitionRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAuctionRepository _auctionRepository;

        public GuestService(
            ApplicationDbContext context,
            IArtworkRepository artworkRepository,
            IExhibitionRepository exhibitionRepository,
            ICategoryRepository categoryRepository,
            IAuctionRepository auctionRepository)
        {
            _context = context;
            _artworkRepository = artworkRepository;
            _exhibitionRepository = exhibitionRepository;
            _categoryRepository = categoryRepository;
            _auctionRepository = auctionRepository;
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetAllArtworksAsync(int skip = 0, int take = 50)
        {
            var artworks = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available)
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return artworks.Select(MapToGuestArtworkDto);
        }

        public async Task<GuestArtworkDetailDto?> GetArtworkDetailsAsync(long artworkId)
        {
            var artwork = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .FirstOrDefaultAsync(a => a.Id == artworkId && a.DeletedAt == null && a.Status == ArtworkStatus.Available);

            if (artwork == null) return null;

            var detailDto = MapToGuestArtworkDetailDto(artwork);

            // Get auction details if artwork is for auction
            if (artwork.IsFor == ArtworkFor.Auction)
            {
                detailDto.AuctionDetails = await GetAuctionDetailsAsync(artworkId);
            }

            // Get related artworks (same category or same seller)
            detailDto.RelatedArtworks = (await GetRelatedArtworksAsync(artworkId, 5)).ToList();

            return detailDto;
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetArtworksByCategoryAsync(int categoryId, int skip = 0, int take = 50)
        {
            var artworks = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.CategoryId == categoryId && a.DeletedAt == null && a.Status == ArtworkStatus.Available)
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return artworks.Select(MapToGuestArtworkDto);
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetFeaturedArtworksAsync(int count = 10)
        {
            // Get featured artworks - for now, get the most recently added available artworks
            var artworks = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            return artworks.Select(MapToGuestArtworkDto);
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetRecentArtworksAsync(int count = 10)
        {
            var artworks = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            return artworks.Select(MapToGuestArtworkDto);
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetRelatedArtworksAsync(long artworkId, int count = 5)
        {
            var artwork = await _context.Artworks
                .FirstOrDefaultAsync(a => a.Id == artworkId);

            if (artwork == null) return new List<GuestArtworkDto>();

            var relatedArtworks = await _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.Id != artworkId && 
                           a.DeletedAt == null && 
                           a.Status == ArtworkStatus.Available &&
                           (a.CategoryId == artwork.CategoryId || a.SellerId == artwork.SellerId))
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            return relatedArtworks.Select(MapToGuestArtworkDto);
        }

        public async Task<GuestSearchResultDto> SearchArtworksAsync(GuestSearchRequestDto searchRequest)
        {
            var query = _context.Artworks
                .Include(a => a.Category)
                .Include(a => a.Seller)
                .Include(a => a.ArtworkImages)
                .Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available);

            // Apply filters
            if (!string.IsNullOrEmpty(searchRequest.Keyword))
            {
                var keyword = searchRequest.Keyword.ToLower();
                query = query.Where(a => a.Title.ToLower().Contains(keyword) ||
                                        (a.Description != null && a.Description.ToLower().Contains(keyword)) ||
                                        (a.Seller.FullName != null && a.Seller.FullName.ToLower().Contains(keyword)));
            }

            if (searchRequest.CategoryId.HasValue)
            {
                query = query.Where(a => a.CategoryId == searchRequest.CategoryId.Value);
            }

            if (searchRequest.MinPrice.HasValue)
            {
                query = query.Where(a => a.FixedPrice >= searchRequest.MinPrice.Value);
            }

            if (searchRequest.MaxPrice.HasValue)
            {
                query = query.Where(a => a.FixedPrice <= searchRequest.MaxPrice.Value);
            }

            if (!string.IsNullOrEmpty(searchRequest.ArtworkFor))
            {
                if (Enum.TryParse<ArtworkFor>(searchRequest.ArtworkFor, true, out var artworkFor))
                {
                    query = query.Where(a => a.IsFor == artworkFor);
                }
            }

            // Apply sorting
            query = searchRequest.SortBy?.ToLower() switch
            {
                "title" => searchRequest.SortOrder?.ToUpper() == "ASC" 
                    ? query.OrderBy(a => a.Title) 
                    : query.OrderByDescending(a => a.Title),
                "price" => searchRequest.SortOrder?.ToUpper() == "ASC" 
                    ? query.OrderBy(a => a.FixedPrice) 
                    : query.OrderByDescending(a => a.FixedPrice),
                _ => searchRequest.SortOrder?.ToUpper() == "ASC" 
                    ? query.OrderBy(a => a.CreatedAt) 
                    : query.OrderByDescending(a => a.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var skip = (searchRequest.Page - 1) * searchRequest.PageSize;
            
            var artworks = await query
                .Skip(skip)
                .Take(searchRequest.PageSize)
                .ToListAsync();

            return new GuestSearchResultDto
            {
                TotalCount = totalCount,
                Page = searchRequest.Page,
                PageSize = searchRequest.PageSize,
                Artworks = artworks.Select(MapToGuestArtworkDto).ToList()
            };
        }

        public async Task<IEnumerable<GuestCategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _context.Categories
                .Include(c => c.Artworks.Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available))
                .ToListAsync();

            return categories.Select(c => new GuestCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ArtworkCount = c.Artworks.Count
            });
        }

        public async Task<GuestCategoryDto?> GetCategoryDetailsAsync(int categoryId)
        {
            var category = await _context.Categories
                .Include(c => c.Artworks.Where(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available))
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null) return null;

            return new GuestCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ArtworkCount = category.Artworks.Count
            };
        }

        public async Task<IEnumerable<GuestExhibitionDto>> GetAllExhibitionsAsync(int skip = 0, int take = 50)
        {
            var exhibitions = await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null)
                .OrderByDescending(e => e.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return exhibitions.Select(MapToGuestExhibitionDto);
        }

        public async Task<GuestExhibitionDto?> GetExhibitionDetailsAsync(long exhibitionId)
        {
            var exhibition = await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.Category)
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.Seller)
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .FirstOrDefaultAsync(e => e.Id == exhibitionId && e.DeletedAt == null);

            return exhibition == null ? null : MapToGuestExhibitionDto(exhibition);
        }

        public async Task<IEnumerable<GuestExhibitionDto>> GetActiveExhibitionsAsync()
        {
            var now = DateTime.UtcNow;
            var exhibitions = await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && 
                           e.StartDate <= now && 
                           (e.EndDate == null || e.EndDate >= now))
                .OrderByDescending(e => e.StartDate)
                .ToListAsync();

            return exhibitions.Select(MapToGuestExhibitionDto);
        }

        public async Task<IEnumerable<GuestExhibitionDto>> GetUpcomingExhibitionsAsync()
        {
            var now = DateTime.UtcNow;
            var exhibitions = await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && e.StartDate > now)
                .OrderBy(e => e.StartDate)
                .ToListAsync();

            return exhibitions.Select(MapToGuestExhibitionDto);
        }

        public async Task<IEnumerable<GuestExhibitionDto>> GetPastExhibitionsAsync()
        {
            var now = DateTime.UtcNow;
            var exhibitions = await _context.Exhibitions
                .Include(e => e.ExhibitionArtworks)
                    .ThenInclude(ea => ea.Artwork)
                        .ThenInclude(a => a.ArtworkImages)
                .Where(e => e.DeletedAt == null && e.EndDate < now)
                .OrderByDescending(e => e.EndDate)
                .ToListAsync();

            return exhibitions.Select(MapToGuestExhibitionDto);
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetExhibitionArtworksAsync(long exhibitionId)
        {
            var artworks = await _context.ExhibitionArtworks
                .Include(ea => ea.Artwork)
                    .ThenInclude(a => a.Category)
                .Include(ea => ea.Artwork)
                    .ThenInclude(a => a.Seller)
                .Include(ea => ea.Artwork)
                    .ThenInclude(a => a.ArtworkImages)
                .Where(ea => ea.ExhibitionId == exhibitionId && 
                            ea.Artwork.DeletedAt == null && 
                            ea.Artwork.Status == ArtworkStatus.Available)
                .Select(ea => ea.Artwork)
                .ToListAsync();

            return artworks.Select(MapToGuestArtworkDto);
        }

        public async Task<GuestStatisticsDto> GetStatisticsAsync()
        {
            var totalArtworks = await _context.Artworks
                .CountAsync(a => a.DeletedAt == null && a.Status == ArtworkStatus.Available);

            var activeAuctions = await _context.Auctions
                .CountAsync(a => a.Status == AuctionStatus.Running);

            var now = DateTime.UtcNow;
            var activeExhibitions = await _context.Exhibitions
                .CountAsync(e => e.DeletedAt == null && 
                               e.StartDate <= now && 
                               (e.EndDate == null || e.EndDate >= now));

            var totalCategories = await _context.Categories.CountAsync();

            var featuredArtworks = await GetFeaturedArtworksAsync(5);
            var recentArtworks = await GetRecentArtworksAsync(5);

            return new GuestStatisticsDto
            {
                TotalArtworks = totalArtworks,
                ActiveAuctions = activeAuctions,
                ActiveExhibitions = activeExhibitions,
                TotalCategories = totalCategories,
                FeaturedArtworks = featuredArtworks.ToList(),
                RecentArtworks = recentArtworks.ToList()
            };
        }

        public async Task<IEnumerable<GuestArtworkDto>> GetActiveAuctionsAsync(int skip = 0, int take = 50)
        {
            var auctionArtworks = await _context.Auctions
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.Category)
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.Seller)
                .Include(a => a.Artwork)
                    .ThenInclude(aw => aw.ArtworkImages)
                .Where(a => a.Status == AuctionStatus.Running)
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(take)
                .Select(a => a.Artwork)
                .ToListAsync();

            return auctionArtworks.Select(MapToGuestArtworkDto);
        }

        public async Task<GuestAuctionDto?> GetAuctionDetailsAsync(long artworkId)
        {
            var auction = await _context.Auctions
                .FirstOrDefaultAsync(a => a.ArtworkId == artworkId);

            if (auction == null) return null;

            var now = DateTime.UtcNow;
            var isActive = auction.Status == AuctionStatus.Running && 
                          auction.StartTime <= now && 
                          auction.EndTime > now;

            // Since the bidding system uses JSON files, we'll provide basic auction info
            // without current bid details for guest users
            return new GuestAuctionDto
            {
                Id = auction.Id,
                StartTime = auction.StartTime,
                EndTime = auction.EndTime,
                StartingPrice = auction.StartingPrice,
                ReservePrice = auction.ReservePrice,
                MinimumIncrement = auction.MinimumIncrement,
                Status = auction.Status.ToString(),
                CurrentHighestBid = null, // Not accessible for guest users
                BidCount = 0, // Not accessible for guest users
                IsActive = isActive,
                TimeRemaining = isActive ? auction.EndTime - now : null
            };
        }

        // Helper methods
        private static GuestArtworkDto MapToGuestArtworkDto(Artwork artwork)
        {
            return new GuestArtworkDto
            {
                Id = artwork.Id,
                Title = artwork.Title,
                Description = artwork.Description,
                CategoryId = artwork.CategoryId,
                CategoryName = artwork.Category?.Name,
                CreationYear = artwork.CreationYear,
                Dimensions = artwork.Dimensions,
                Condition = artwork.Condition,
                Material = null, // Material property doesn't exist in Artwork model
                Price = artwork.FixedPrice,
                ArtworkFor = artwork.IsFor.ToString(),
                Status = artwork.Status.ToString(),
                CreatedAt = artwork.CreatedAt,
                SellerName = artwork.Seller?.FullName ?? string.Empty,
                Images = artwork.ArtworkImages?.Select(img => new GuestArtworkImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.FilePath,
                    IsPrimary = img.IsPrimary
                }).ToList() ?? new List<GuestArtworkImageDto>()
            };
        }

        private static GuestArtworkDetailDto MapToGuestArtworkDetailDto(Artwork artwork)
        {
            return new GuestArtworkDetailDto
            {
                Id = artwork.Id,
                Title = artwork.Title,
                Description = artwork.Description,
                CategoryId = artwork.CategoryId,
                CategoryName = artwork.Category?.Name,
                CreationYear = artwork.CreationYear,
                Dimensions = artwork.Dimensions,
                Condition = artwork.Condition,
                Material = null, // Material property doesn't exist in Artwork model
                Price = artwork.FixedPrice,
                ArtworkFor = artwork.IsFor.ToString(),
                Status = artwork.Status.ToString(),
                CreatedAt = artwork.CreatedAt,
                SellerName = artwork.Seller?.FullName ?? string.Empty,
                SellerBio = artwork.Seller?.Bio,
                Images = artwork.ArtworkImages?.Select(img => new GuestArtworkImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.FilePath,
                    IsPrimary = img.IsPrimary
                }).ToList() ?? new List<GuestArtworkImageDto>(),
                RelatedArtworks = new List<GuestArtworkDto>()
            };
        }

        private static GuestExhibitionDto MapToGuestExhibitionDto(Exhibition exhibition)
        {
            var now = DateTime.UtcNow;
            string status;
            
            if (exhibition.StartDate > now)
                status = "Upcoming";
            else if (exhibition.EndDate == null || exhibition.EndDate >= now)
                status = "Active";
            else
                status = "Past";

            var featuredArtworks = exhibition.ExhibitionArtworks?
                .Where(ea => ea.Artwork.DeletedAt == null && ea.Artwork.Status == ArtworkStatus.Available)
                .Take(3)
                .Select(ea => MapToGuestArtworkDto(ea.Artwork))
                .ToList() ?? new List<GuestArtworkDto>();

            return new GuestExhibitionDto
            {
                Id = exhibition.Id,
                Title = exhibition.Title,
                Description = exhibition.Description,
                Location = exhibition.Location,
                StartDate = exhibition.StartDate,
                EndDate = exhibition.EndDate,
                CreatedAt = exhibition.CreatedAt,
                Status = status,
                ArtworkCount = exhibition.ExhibitionArtworks?.Count(ea => 
                    ea.Artwork.DeletedAt == null && ea.Artwork.Status == ArtworkStatus.Available) ?? 0,
                FeaturedArtworks = featuredArtworks
            };
        }
    }
}