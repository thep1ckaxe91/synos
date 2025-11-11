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
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<SellerController> _logger;

        public SellerController(ISellerService sellerService, IWebHostEnvironment env, ILogger<SellerController> logger)
        {
            _sellerService = sellerService;
            _env = env;
            _logger = logger;
        }

        [HttpPost("artworks/upload")]
        public async Task<IActionResult> UploadArtworkImage(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var uploadedUrls = new List<string>();
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "artworks");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                        var filePath = Path.Combine(uploadPath, uniqueFileName);

                        await using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/artworks/{uniqueFileName}";
                        uploadedUrls.Add(fileUrl);
                        _logger.LogInformation("File uploaded successfully: {FilePath}", filePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error uploading file {FileName}", file.FileName);
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                    }
                }
            }

            if (uploadedUrls.Count == 0)
            {
                return BadRequest("No valid files to upload.");
            }

            return Ok(new { urls = uploadedUrls });
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

        [HttpPost("auctions")]
        public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto createAuctionDto)
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var auction = await _sellerService.CreateAuctionAsync(sellerId.Value, createAuctionDto);
            if (auction == null)
            {
                return BadRequest(new { message = "Failed to create auction. Check artwork availability, ownership, or auction times." });
            }
            return CreatedAtAction(nameof(GetArtworks), new { }, auction); // Reusing GetArtworks for CreatedAtAction, ideally should be GetAuctionDetails
        }

        private long? GetCurrentSellerId()
        {
            // A "Seller" is a "Member" with the role "Seller".
            // We can use the existing GetCurrentMemberId extension method.
            return HttpContext.GetCurrentMemberId();
        }
    }
}
