using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Synos.Api.DTOs;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GuestController : ControllerBase
    {
        private readonly IGuestService _guestService;
        private readonly ILogger<GuestController> _logger;

        public GuestController(IGuestService guestService, ILogger<GuestController> logger)
        {
            _guestService = guestService;
            _logger = logger;
        }

        /// <summary>
        /// Get all available artworks with pagination
        /// </summary>
        [HttpGet("artworks")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetAllArtworks(
            [FromQuery] int skip = 0, 
            [FromQuery] int take = 50)
        {
            try
            {
                var artworks = await _guestService.GetAllArtworksAsync(skip, take);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artworks");
                return StatusCode(500, new { message = "An error occurred while retrieving artworks" });
            }
        }

        /// <summary>
        /// Get detailed information about a specific artwork
        /// </summary>
        [HttpGet("artworks/{artworkId}")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestArtworkDetailDto>> GetArtworkDetails(long artworkId)
        {
            try
            {
                var artwork = await _guestService.GetArtworkDetailsAsync(artworkId);
                if (artwork == null)
                    return NotFound(new { message = "Artwork not found" });

                return Ok(artwork);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artwork details for ID: {ArtworkId}", artworkId);
                return StatusCode(500, new { message = "An error occurred while retrieving artwork details" });
            }
        }

        /// <summary>
        /// Get artworks by category
        /// </summary>
        [HttpGet("categories/{categoryId}/artworks")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetArtworksByCategory(
            int categoryId,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 50)
        {
            try
            {
                var artworks = await _guestService.GetArtworksByCategoryAsync(categoryId, skip, take);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artworks for category ID: {CategoryId}", categoryId);
                return StatusCode(500, new { message = "An error occurred while retrieving artworks" });
            }
        }

        /// <summary>
        /// Get featured artworks
        /// </summary>
        [HttpGet("artworks/featured")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetFeaturedArtworks([FromQuery] int count = 10)
        {
            try
            {
                var artworks = await _guestService.GetFeaturedArtworksAsync(count);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving featured artworks");
                return StatusCode(500, new { message = "An error occurred while retrieving featured artworks" });
            }
        }

        /// <summary>
        /// Get recently added artworks
        /// </summary>
        [HttpGet("artworks/recent")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetRecentArtworks([FromQuery] int count = 10)
        {
            try
            {
                var artworks = await _guestService.GetRecentArtworksAsync(count);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent artworks");
                return StatusCode(500, new { message = "An error occurred while retrieving recent artworks" });
            }
        }

        /// <summary>
        /// Search artworks with filters
        /// </summary>
        [HttpPost("artworks/search")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestSearchResultDto>> SearchArtworks([FromBody] GuestSearchRequestDto searchRequest)
        {
            try
            {
                var result = await _guestService.SearchArtworksAsync(searchRequest);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching artworks");
                return StatusCode(500, new { message = "An error occurred while searching artworks" });
            }
        }

        /// <summary>
        /// Get all categories
        /// </summary>
        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestCategoryDto>>> GetAllCategories()
        {
            try
            {
                var categories = await _guestService.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { message = "An error occurred while retrieving categories" });
            }
        }

        /// <summary>
        /// Get category details
        /// </summary>
        [HttpGet("categories/{categoryId}")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestCategoryDto>> GetCategoryDetails(int categoryId)
        {
            try
            {
                var category = await _guestService.GetCategoryDetailsAsync(categoryId);
                if (category == null)
                    return NotFound(new { message = "Category not found" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category details for ID: {CategoryId}", categoryId);
                return StatusCode(500, new { message = "An error occurred while retrieving category details" });
            }
        }

        /// <summary>
        /// Get all exhibitions with pagination
        /// </summary>
        [HttpGet("exhibitions")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestExhibitionDto>>> GetAllExhibitions(
            [FromQuery] int skip = 0,
            [FromQuery] int take = 50)
        {
            try
            {
                var exhibitions = await _guestService.GetAllExhibitionsAsync(skip, take);
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving exhibitions");
                return StatusCode(500, new { message = "An error occurred while retrieving exhibitions" });
            }
        }

        /// <summary>
        /// Get exhibition details
        /// </summary>
        [HttpGet("exhibitions/{exhibitionId}")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestExhibitionDto>> GetExhibitionDetails(long exhibitionId)
        {
            try
            {
                var exhibition = await _guestService.GetExhibitionDetailsAsync(exhibitionId);
                if (exhibition == null)
                    return NotFound(new { message = "Exhibition not found" });

                return Ok(exhibition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving exhibition details for ID: {ExhibitionId}", exhibitionId);
                return StatusCode(500, new { message = "An error occurred while retrieving exhibition details" });
            }
        }

        /// <summary>
        /// Get active exhibitions
        /// </summary>
        [HttpGet("exhibitions/active")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestExhibitionDto>>> GetActiveExhibitions()
        {
            try
            {
                var exhibitions = await _guestService.GetActiveExhibitionsAsync();
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active exhibitions");
                return StatusCode(500, new { message = "An error occurred while retrieving active exhibitions" });
            }
        }

        /// <summary>
        /// Get upcoming exhibitions
        /// </summary>
        [HttpGet("exhibitions/upcoming")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestExhibitionDto>>> GetUpcomingExhibitions()
        {
            try
            {
                var exhibitions = await _guestService.GetUpcomingExhibitionsAsync();
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving upcoming exhibitions");
                return StatusCode(500, new { message = "An error occurred while retrieving upcoming exhibitions" });
            }
        }

        /// <summary>
        /// Get past exhibitions
        /// </summary>
        [HttpGet("exhibitions/past")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestExhibitionDto>>> GetPastExhibitions()
        {
            try
            {
                var exhibitions = await _guestService.GetPastExhibitionsAsync();
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving past exhibitions");
                return StatusCode(500, new { message = "An error occurred while retrieving past exhibitions" });
            }
        }

        /// <summary>
        /// Get artworks in a specific exhibition
        /// </summary>
        [HttpGet("exhibitions/{exhibitionId}/artworks")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetExhibitionArtworks(long exhibitionId)
        {
            try
            {
                var artworks = await _guestService.GetExhibitionArtworksAsync(exhibitionId);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artworks for exhibition ID: {ExhibitionId}", exhibitionId);
                return StatusCode(500, new { message = "An error occurred while retrieving exhibition artworks" });
            }
        }

        /// <summary>
        /// Get active auctions
        /// </summary>
        [HttpGet("auctions")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetActiveAuctions(
            [FromQuery] int skip = 0,
            [FromQuery] int take = 50)
        {
            try
            {
                var auctions = await _guestService.GetActiveAuctionsAsync(skip, take);
                return Ok(auctions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active auctions");
                return StatusCode(500, new { message = "An error occurred while retrieving active auctions" });
            }
        }

        /// <summary>
        /// Get auction details for a specific artwork
        /// </summary>
        [HttpGet("auctions/{artworkId}")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestAuctionDto>> GetAuctionDetails(long artworkId)
        {
            try
            {
                var auction = await _guestService.GetAuctionDetailsAsync(artworkId);
                if (auction == null)
                    return NotFound(new { message = "Auction not found for this artwork" });

                return Ok(auction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving auction details for artwork ID: {ArtworkId}", artworkId);
                return StatusCode(500, new { message = "An error occurred while retrieving auction details" });
            }
        }

        /// <summary>
        /// Get general statistics and overview data
        /// </summary>
        [HttpGet("statistics")]
        [AllowAnonymous]
        public async Task<ActionResult<GuestStatisticsDto>> GetStatistics()
        {
            try
            {
                var statistics = await _guestService.GetStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statistics");
                return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
            }
        }

        /// <summary>
        /// Get related artworks for a specific artwork
        /// </summary>
        [HttpGet("artworks/{artworkId}/related")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GuestArtworkDto>>> GetRelatedArtworks(
            long artworkId,
            [FromQuery] int count = 5)
        {
            try
            {
                var artworks = await _guestService.GetRelatedArtworksAsync(artworkId, count);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving related artworks for ID: {ArtworkId}", artworkId);
                return StatusCode(500, new { message = "An error occurred while retrieving related artworks" });
            }
        }

        /// <summary>
        /// Get application information (About Us, Contact Us, etc.)
        /// </summary>
        [HttpGet("info")]
        [AllowAnonymous]
        public IActionResult GetApplicationInfo()
        {
            try
            {
                var info = new
                {
                    AppName = "Synos Art Gallery",
                    Version = "1.0.0",
                    Description = "A comprehensive art gallery and auction platform connecting artists, collectors, and art enthusiasts.",
                    Contact = new
                    {
                        Email = "info@synos.art",
                        Phone = "+84-xxx-xxx-xxx",
                        Address = "Vietnam"
                    },
                    Features = new[]
                    {
                        "Browse and search artworks",
                        "View art exhibitions",
                        "Participate in auctions",
                        "Purchase artworks",
                        "Artist portfolio management",
                        "Secure payment processing"
                    },
                    SupportedPaymentMethods = new[] { "VNPay", "Credit Card", "Debit Card" }
                };

                return Ok(info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving application info");
                return StatusCode(500, new { message = "An error occurred while retrieving application info" });
            }
        }

        [HttpGet("exhibitions/view/{id}")]
        public async Task<ActionResult<GuestExhibitionViewDto>> GetExhibition(long id)
        {
            var exhibition = await _guestService.GetExhibitionAsync(id);
            if (exhibition == null)
            {
                return NotFound();
            }
            return Ok(exhibition);
        }
    }
}