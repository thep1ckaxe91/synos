using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Repositories;
using System.Linq;

namespace Synos.Api.Services
{
    public class SellerService : ISellerService
    {
        private readonly IArtworkRepository _artworkRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly ICategoryRepository _categoryRepository;

        public SellerService(
            IArtworkRepository artworkRepository,
            IOrderRepository orderRepository,
            IMemberRepository memberRepository,
            ICategoryRepository categoryRepository)
        {
            _artworkRepository = artworkRepository;
            _orderRepository = orderRepository;
            _memberRepository = memberRepository;
            _categoryRepository = categoryRepository;
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
                IsFor = artworkDto.SaleType == SaleTypeDto.FixedPrice ? ArtworkFor.Fixed : ArtworkFor.Auction,
                FixedPrice = artworkDto.SaleType == SaleTypeDto.FixedPrice ? artworkDto.Price : (decimal?)null,
                Status = ArtworkStatus.Pending, // Artworks need approval first
                ArtworkImages = artworkDto.ImageUrls.Select((url, index) => new ArtworkImage
                {
                    FilePath = url,
                    IsPrimary = index == 0
                }).ToList()
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
                PrimaryImage = createdArtwork.ArtworkImages.FirstOrDefault(i => i.IsPrimary)?.FilePath,
                CreatedAt = createdArtwork.CreatedAt,
                CategoryName = category.Name
            };
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
                PrimaryImage = artwork.ArtworkImages?.FirstOrDefault(i => i.IsPrimary)?.FilePath,
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
                        salesHistory.Add(new SalesHistoryDto
                        {
                            OrderId = order.Id,
                            ArtworkTitle = item.Artwork.Title,
                            PrimaryImage = item.Artwork.ArtworkImages?.FirstOrDefault(i => i.IsPrimary)?.FilePath,
                            SoldAt = order.PaymentTime,
                            SalePrice = item.Total,
                            BuyerName = order.User?.FullName ?? "N/A"
                        });
                    }
                }
            }

            return salesHistory;
        }
    }
}
