using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;
using Synos.Api.Utils;
using System.Linq;

namespace Synos.Api.Services
{
    public class SellerService : ISellerService
    {
        private readonly IArtworkRepository _artworkRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICommissionRepository _commissionRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuctionRepository _auctionRepository;

        public SellerService(
            IArtworkRepository artworkRepository,
            IOrderRepository orderRepository,
            IMemberRepository memberRepository,
            ICategoryRepository categoryRepository,
            ICommissionRepository commissionRepository,
            IWebHostEnvironment webHostEnvironment,
            IHttpContextAccessor httpContextAccessor,
            IAuctionRepository auctionRepository)
        {
            _artworkRepository = artworkRepository;
            _orderRepository = orderRepository;
            _memberRepository = memberRepository;
            _categoryRepository = categoryRepository;
            _commissionRepository = commissionRepository;
            _webHostEnvironment = webHostEnvironment;
            _httpContextAccessor = httpContextAccessor;
            _auctionRepository = auctionRepository;
        }

        private string GetBaseUrl()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return "http://localhost:8080"; // Fallback for Docker environment

            return $"{request.Scheme}://{request.Host}";
        }

        private string ConvertFilePathToUrl(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;

            var baseUrl = GetBaseUrl();
            var normalizedPath = filePath.Replace("\\", "/");
            
            // If path already starts with uploads/, don't add it again
            if (normalizedPath.StartsWith("uploads/"))
            {
                return $"{baseUrl}/{normalizedPath}";
            }
            
            return $"{baseUrl}/uploads/{normalizedPath}";
        }

        public async Task<SellerArtworkDto?> CreateArtworkAsync(long sellerId, CreateArtworkDto artworkDto)
        {
            var seller = await _memberRepository.GetMemberByIdAsync(sellerId);
            if (seller == null || seller.Role != MemberRole.Seller)
            {
                return null; // Or throw an exception
            }

            var category = await _categoryRepository.GetCategoryByIdAsync(artworkDto.CategoryId);
            if (category == null)
            {
                return null; // Or throw an exception
            }

            var artwork = new Artwork
            {
                Title = artworkDto.Title,
                Description = artworkDto.Description,
                SellerId = sellerId,
                CategoryId = (int)artworkDto.CategoryId,
                CreationYear = artworkDto.CreationYear,
                Dimensions = artworkDto.Dimensions,
                Condition = artworkDto.Condition,
                Currency = artworkDto.Currency,
                IsFor = artworkDto.SaleType == SaleTypeDto.FixedPrice ? ArtworkFor.Fixed : ArtworkFor.Auction,
                FixedPrice = artworkDto.SaleType == SaleTypeDto.FixedPrice ? artworkDto.Price : (decimal?)null,
                Status = ArtworkStatus.Pending, // Artworks need approval first
                CreatedAt = TimeUtils.GetCurrentTime(),
                UpdatedAt = TimeUtils.GetCurrentTime()
                // Note: This method is deprecated - use CreateArtworkWithFilesAsync instead
            };

            var createdArtwork = await _artworkRepository.CreateArtworkAsync(artwork);

            return new SellerArtworkDto
            {
                Id = createdArtwork.Id,
                Title = createdArtwork.Title,
                Description = createdArtwork.Description,
                Price = createdArtwork.FixedPrice ?? 0,
                SaleType = createdArtwork.IsFor.ToString(),
                Status = createdArtwork.Status.ToString(),
                PrimaryImage = ConvertFilePathToUrl(createdArtwork.ArtworkImages.FirstOrDefault(i => i.IsPrimary)?.FilePath ?? string.Empty),
                Images = createdArtwork.ArtworkImages?.Select(img => new ArtworkImageDto
                {
                    Id = img.Id,
                    ImageUrl = ConvertFilePathToUrl(img.FilePath ?? string.Empty),
                    IsPrimary = img.IsPrimary,
                    UploadedAt = img.UploadedAt
                }).ToList() ?? new List<ArtworkImageDto>(),
                CreatedAt = createdArtwork.CreatedAt,
                CategoryName = createdArtwork.Category?.Name ?? "N/A"
            };
        }

        public async Task<SellerArtworkDto?> CreateArtworkWithFilesAsync(long sellerId, CreateArtworkWithFilesDto artworkDto)
        {
            // Validate seller
            var seller = await _memberRepository.GetMemberByIdAsync(sellerId);
            if (seller == null || seller.Role != MemberRole.Seller)
            {
                return null;
            }

            // Validate category
            var category = await _categoryRepository.GetCategoryByIdAsync(artworkDto.CategoryId);
            if (category == null)
            {
                return null;
            }

            // Upload images and get their file paths
            var uploadedImagePaths = new List<string>();
            try
            {
                // Get web root path with fallback for Docker environment
                var webRootPath = _webHostEnvironment.WebRootPath ?? 
                                  Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                
                // Ensure the wwwroot directory exists
                if (!Directory.Exists(webRootPath))
                {
                    Directory.CreateDirectory(webRootPath);
                }

                foreach (var imageFile in artworkDto.Images)
                {
                    var imagePath = await ImageUploadUtils.UploadArtworkImageAsync(
                        imageFile, 
                        webRootPath);
                    uploadedImagePaths.Add(imagePath);
                }

                if (!uploadedImagePaths.Any())
                {
                    throw new InvalidOperationException("Failed to upload any images");
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"Image upload failed: {ex.Message}");
            }

            // Create artwork entity with metadata
            var artwork = new Artwork
            {
                Title = artworkDto.Title,
                Description = artworkDto.Description,
                SellerId = sellerId,
                CategoryId = (int)artworkDto.CategoryId,
                CreationYear = artworkDto.CreationYear,
                Dimensions = artworkDto.Dimensions,
                Condition = artworkDto.Condition,
                Currency = artworkDto.Currency,
                IsFor = artworkDto.SaleType == SaleTypeDto.FixedPrice ? ArtworkFor.Fixed : ArtworkFor.Auction,
                FixedPrice = artworkDto.SaleType == SaleTypeDto.FixedPrice ? artworkDto.Price : (decimal?)null,
                Status = ArtworkStatus.Pending, // Artworks need approval first
                CreatedAt = TimeUtils.GetCurrentTime(),
                UpdatedAt = TimeUtils.GetCurrentTime(),
                ArtworkImages = uploadedImagePaths.Select((imagePath, index) => new ArtworkImage
                {
                    FilePath = imagePath,
                    IsPrimary = index == 0, // First image is primary
                    UploadedAt = TimeUtils.GetCurrentTime()
                }).ToList()
            };

            try
            {
                var createdArtwork = await _artworkRepository.CreateArtworkAsync(artwork);

                return new SellerArtworkDto
                {
                    Id = createdArtwork.Id,
                    Title = createdArtwork.Title,
                    Description = createdArtwork.Description,
                    Price = createdArtwork.FixedPrice ?? 0,
                    SaleType = createdArtwork.IsFor.ToString(),
                    Status = createdArtwork.Status.ToString(),
                    PrimaryImage = ConvertFilePathToUrl(createdArtwork.ArtworkImages.FirstOrDefault(i => i.IsPrimary)?.FilePath ?? string.Empty),
                    Images = createdArtwork.ArtworkImages?.Select(img => new ArtworkImageDto
                    {
                        Id = img.Id,
                        ImageUrl = ConvertFilePathToUrl(img.FilePath ?? string.Empty),
                        IsPrimary = img.IsPrimary,
                        UploadedAt = img.UploadedAt
                    }).ToList() ?? new List<ArtworkImageDto>(),
                    CreatedAt = createdArtwork.CreatedAt,
                    CategoryName = category.Name
                };
            }
            catch (Exception)
            {
                // If artwork creation fails, clean up uploaded images
                foreach (var imagePath in uploadedImagePaths)
                {
                    ImageUploadUtils.DeleteArtworkImage(imagePath, _webHostEnvironment.WebRootPath ?? string.Empty);
                }
                throw;
            }
        }

        public async Task<IEnumerable<SellerArtworkDto>> GetArtworksBySellerAsync(long sellerId)
        {
            var artworks = await _artworkRepository.GetArtworksBySellerIdAsync(sellerId);

            return artworks.Select(artwork => new SellerArtworkDto
            {
                Id = artwork.Id,
                Title = artwork.Title,
                Description = artwork.Description,
                Price = artwork.FixedPrice ?? 0,
                SaleType = artwork.IsFor.ToString(),
                Status = artwork.Status.ToString(),
                PrimaryImage = ConvertFilePathToUrl(artwork.ArtworkImages?.FirstOrDefault(i => i.IsPrimary)?.FilePath ?? string.Empty),
                Images = artwork.ArtworkImages?.Select(img => new ArtworkImageDto
                {
                    Id = img.Id,
                    ImageUrl = ConvertFilePathToUrl(img.FilePath ?? string.Empty),
                    IsPrimary = img.IsPrimary,
                    UploadedAt = img.UploadedAt
                }).ToList() ?? new List<ArtworkImageDto>(),
                CreatedAt = artwork.CreatedAt,
                CategoryName = artwork.Category?.Name ?? "N/A"
            });
        }

        public async Task<IEnumerable<SalesHistoryDto>> GetSalesHistoryAsync(long sellerId)
        {
            var orders = await _orderRepository.GetOrdersBySellerIdAsync(sellerId);
            var salesHistory = new List<SalesHistoryDto>();

            // We only care about completed sales
            var completedOrders = orders.Where(o => o.Status == OrderStatus.Paid);

            foreach (var order in completedOrders)
            {
                foreach (var item in order.OrderItems)
                {
                    // Ensure the artwork in the order item belongs to the seller
                    if (item.Artwork != null && item.Artwork.SellerId == sellerId)
                    {
                        var commissionAmount = 0m;
                        var payoutAmount = item.Total;

                        var commissions = await _commissionRepository.GetCommissionsByArtworkIdAsync((int)item.Artwork.Id);
                        var commission = commissions.FirstOrDefault(); // Assuming the first commission is the one to use

                        if (commission != null)
                        {
                            if (commission.CommissionType == CommissionType.Percentage)
                            {
                                commissionAmount = item.Total * (commission.Value / 100);
                            }
                            else // Fixed
                            {
                                commissionAmount = commission.Value;
                            }
                            payoutAmount = item.Total - commissionAmount;
                        }

                        salesHistory.Add(new SalesHistoryDto
                        {
                            OrderId = order.Id,
                            ArtworkTitle = item.Artwork.Title,
                            PrimaryImage = ConvertFilePathToUrl(item.Artwork.ArtworkImages?.FirstOrDefault(i => i.IsPrimary)?.FilePath ?? string.Empty),
                            SoldAt = order.PaymentTime,
                            SalePrice = item.Total,
                            CommissionAmount = commissionAmount,
                            PayoutAmount = payoutAmount,
                            BuyerName = order.User?.FullName ?? "N/A"
                        });
                    }
                }
            }

            return salesHistory;
        }

        public async Task<AuctionResponseDto?> CreateAuctionAsync(long sellerId, CreateAuctionDto createAuctionDto)
        {
            var seller = await _memberRepository.GetMemberByIdAsync(sellerId);
            if (seller == null || seller.Role != MemberRole.Seller)
            {
                return null; // Only sellers can create auctions
            }

            var artwork = await _artworkRepository.GetArtworkByIdAsync(createAuctionDto.ArtworkId);
            if (artwork == null || artwork.SellerId != sellerId || artwork.IsFor != ArtworkFor.Auction || artwork.Status != ArtworkStatus.Available)
            {
                return null; // Artwork not found, not owned by seller, not for auction, or not available
            }

            if (createAuctionDto.StartTime >= createAuctionDto.EndTime || createAuctionDto.StartTime < TimeUtils.GetCurrentTime())
            {
                return null; // Invalid auction times
            }

            var auction = new Auction
            {
                ArtworkId = createAuctionDto.ArtworkId,
                StartTime = createAuctionDto.StartTime,
                EndTime = createAuctionDto.EndTime,
                StartingPrice = createAuctionDto.StartingPrice,
                ReservePrice = createAuctionDto.ReservePrice,
                Status = AuctionStatus.Scheduled // Initially scheduled
            };

            var createdAuction = await _auctionRepository.CreateAuctionAsync(auction);
            if (createdAuction == null)
            {
                return null;
            }

            // Create the JSON bidding file for the auction
            await CreateBiddingFileAsync(createdAuction);
            
            // Return DTO instead of entity to avoid circular references
            return new AuctionResponseDto
            {
                Id = createdAuction.Id,
                ArtworkId = createdAuction.ArtworkId,
                ArtworkTitle = artwork.Title,
                StartTime = createdAuction.StartTime,
                EndTime = createdAuction.EndTime,
                StartingPrice = createdAuction.StartingPrice,
                ReservePrice = createdAuction.ReservePrice,
                MinimumIncrement = createdAuction.MinimumIncrement,
                Status = createdAuction.Status.ToString(),
                WinnerBidId = createdAuction.WinnerBidId,
                CreatedAt = createdAuction.CreatedAt
            };
        }

        private async Task CreateBiddingFileAsync(Auction auction)
        {
            var auctionDataPath = Path.Combine(_webHostEnvironment.ContentRootPath, "AuctionData");
            if (!Directory.Exists(auctionDataPath))
            {
                Directory.CreateDirectory(auctionDataPath);
            }

            var biddingData = new List<object>(); // Just an empty array of bids

            var filePath = Path.Combine(auctionDataPath, $"{auction.Id}.json");
            await File.WriteAllTextAsync(filePath, System.Text.Json.JsonSerializer.Serialize(biddingData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        }
    }
}
