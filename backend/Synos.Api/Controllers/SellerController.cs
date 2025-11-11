using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.DTOs;
using Synos.Api.Extensions;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/seller")]
    [JwtAuthorize("Seller")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpPost("artworks")]
        public async Task<ActionResult<SellerArtworkDto>> CreateArtwork([FromForm] CreateArtworkWithFilesDto artworkDto)
        {
            try
            {
                var sellerId = GetCurrentSellerId();
                if (sellerId == null)
                {
                    return Unauthorized(new { message = "Invalid token or not a seller." });
                }

                // Validate that at least one image is provided
                if (artworkDto.Images == null || !artworkDto.Images.Any())
                {
                    return BadRequest(new { message = "At least one image is required." });
                }

                var artwork = await _sellerService.CreateArtworkWithFilesAsync(sellerId.Value, artworkDto);
                if (artwork == null)
                {
                    return BadRequest(new { message = "Failed to create artwork." });
                }

                return CreatedAtAction(nameof(GetArtworks), new { }, artwork);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                // Log the exception in a real application
                return StatusCode(500, new { message = "An error occurred while creating the artwork." });
            }
        }

        [HttpGet("artworks")]
        public async Task<ActionResult<IEnumerable<SellerArtworkDto>>> GetArtworks()
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var artworks = await _sellerService.GetArtworksBySellerAsync(sellerId.Value);
            return Ok(artworks);
        }

        [HttpGet("sales-history")]
        public async Task<ActionResult<IEnumerable<SalesHistoryDto>>> GetSalesHistory()
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var salesHistory = await _sellerService.GetSalesHistoryAsync(sellerId.Value);
            return Ok(salesHistory);
        }

        private long? GetCurrentSellerId()
        {
            // A "Seller" is a "Member" with the role "Seller".
            // We can use the existing GetCurrentMemberId extension method.
            return HttpContext.GetCurrentMemberId();
        }
    }
}
